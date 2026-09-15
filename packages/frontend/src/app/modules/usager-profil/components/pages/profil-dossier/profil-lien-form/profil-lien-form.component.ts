import { Component, Input, OnDestroy, OnInit } from "@angular/core";
import {
  Subject,
  Subscription,
  debounceTime,
  distinctUntilChanged,
  switchMap,
} from "rxjs";
import {
  UserStructure,
  UsagerLienSearchResult,
  UsagerLienSuggestion,
  UsagerLienSummary,
} from "@domifa/common";
import { UsagerFormModel } from "../../../../../usager-shared/interfaces";
import { UsagerLienService } from "../../../../../usager-shared/services/usager-lien.service";
import { CustomToastService } from "../../../../../shared/services";

const SEARCH_MIN_LENGTH = 2;

// Sélection en cours d'édition, pas encore enregistrée : peut venir du lien
// existant (pré-rempli à l'ouverture), d'un résultat de recherche ou de la
// suggestion acceptée. Rien n'est appelé côté API avant "Enregistrer".
interface StagedSelection {
  uuid: string;
  nom: string;
  prenom: string;
  customRef: string | null;
  statut?: string;
  fromSuggestion: boolean;
}

@Component({
  selector: "app-profil-lien-form",
  templateUrl: "./profil-lien-form.component.html",
  standalone: false,
})
export class ProfilLienFormComponent implements OnInit, OnDestroy {
  @Input({ required: true }) public usager!: UsagerFormModel;
  @Input({ required: true }) public me!: UserStructure | null;

  public currentLien: UsagerLienSummary | null = null;
  public suggestion: UsagerLienSuggestion | null = null;
  public selection: StagedSelection | null = null;

  public editMode = false;
  public loading = false;
  public saving = false;
  public canEdit = false;

  public searchQuery = "";
  public searchResults: UsagerLienSearchResult[] = [];

  private readonly searchTerms = new Subject<string>();
  private readonly subscription = new Subscription();

  constructor(
    private readonly usagerLienService: UsagerLienService,
    private readonly toastService: CustomToastService
  ) {}

  public ngOnInit(): void {
    this.canEdit = this.me?.role !== "facteur";
    this.refresh();

    this.subscription.add(
      this.searchTerms
        .pipe(
          debounceTime(300),
          distinctUntilChanged(),
          switchMap((query) =>
            query.trim().length >= SEARCH_MIN_LENGTH
              ? this.usagerLienService.search(this.usager.ref, query.trim())
              : []
          )
        )
        .subscribe((results) => (this.searchResults = results))
    );
  }

  public ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  public openEdit(): void {
    if (!this.canEdit) {
      return;
    }
    this.editMode = true;
    this.searchQuery = "";
    this.searchResults = [];
    this.selection = this.currentLien
      ? {
          uuid: this.currentLien.linkedUsager.uuid,
          nom: this.currentLien.linkedUsager.nom,
          prenom: this.currentLien.linkedUsager.prenom,
          customRef: this.currentLien.linkedUsager.customRef,
          statut: this.currentLien.linkedUsager.statut,
          fromSuggestion: false,
        }
      : null;

    if (!this.currentLien && !this.suggestion) {
      // La suggestion s'exécute à l'ouverture du formulaire.
      this.subscription.add(
        this.usagerLienService
          .getSuggestion(this.usager.ref)
          .subscribe((suggestion) => (this.suggestion = suggestion))
      );
    }
  }

  public cancelEdit(): void {
    this.editMode = false;
    this.selection = null;
    this.searchQuery = "";
    this.searchResults = [];
  }

  public onSearchInput(value: string): void {
    this.searchQuery = value;
    if (value.trim().length < SEARCH_MIN_LENGTH) {
      this.searchResults = [];
      return;
    }
    this.searchTerms.next(value);
  }

  public selectCandidate(result: UsagerLienSearchResult): void {
    if (result.alreadyLinkedTo) {
      return;
    }
    this.selection = {
      uuid: result.uuid,
      nom: result.nom,
      prenom: result.prenom,
      customRef: result.customRef,
      fromSuggestion: false,
    };
    this.searchQuery = "";
    this.searchResults = [];
  }

  public accepterSuggestion(): void {
    if (!this.suggestion) {
      return;
    }
    this.selection = {
      uuid: this.suggestion.candidate.uuid,
      nom: this.suggestion.candidate.nom,
      prenom: this.suggestion.candidate.prenom,
      customRef: this.suggestion.candidate.customRef,
      statut: this.suggestion.candidate.statut,
      fromSuggestion: true,
    };
  }

  public rejeterSuggestion(): void {
    if (!this.suggestion) {
      return;
    }
    this.subscription.add(
      this.usagerLienService
        .rejectSuggestion(this.usager.ref, this.suggestion.ayantDroitUuid)
        .subscribe(() => (this.suggestion = null))
    );
  }

  public clearSelection(): void {
    this.selection = null;
  }

  public save(): void {
    const hadLien = !!this.currentLien;
    const targetUuid = this.selection?.uuid ?? null;
    const previousUuid = this.currentLien?.linkedUsager.uuid ?? null;

    if (targetUuid === previousUuid) {
      // Rien n'a changé (même conjoint, ou toujours vide).
      this.editMode = false;
      return;
    }

    this.saving = true;

    if (!targetUuid) {
      this.subscription.add(
        this.usagerLienService.unlink(this.usager.ref).subscribe({
          next: () => this.onSaveSuccess("Dossiers déliés"),
          error: () => this.onSaveError("Impossible de délier ces dossiers"),
        })
      );
      return;
    }

    // Un conjoint déjà relié doit être dissocié avant d'en choisir un autre
    // (la contrainte 1-1 refuserait sinon la nouvelle liaison).
    const doLink = () =>
      this.usagerLienService
        .link(
          this.usager.ref,
          targetUuid,
          this.selection?.fromSuggestion ?? false
        )
        .subscribe({
          next: () => this.onSaveSuccess("Dossiers reliés"),
          error: () => this.onSaveError("Impossible de relier ces dossiers"),
        });

    if (hadLien && previousUuid !== targetUuid) {
      this.subscription.add(
        this.usagerLienService.unlink(this.usager.ref).subscribe({
          next: () => this.subscription.add(doLink()),
          error: () => this.onSaveError("Impossible de délier ces dossiers"),
        })
      );
    } else {
      this.subscription.add(doLink());
    }
  }

  public isCandidatAvertissement(statut: string | undefined): boolean {
    return statut === "RADIE" || statut === "REFUS";
  }

  private onSaveSuccess(message: string): void {
    this.saving = false;
    this.editMode = false;
    this.refresh();
    this.toastService.success(message);
  }

  private onSaveError(message: string): void {
    this.saving = false;
    this.toastService.error(message);
  }

  private refresh(): void {
    this.subscription.add(
      this.usagerLienService.getLien(this.usager.ref).subscribe((lien) => {
        this.currentLien = lien;
        this.suggestion = null;
      })
    );
  }
}
