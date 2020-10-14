import {
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  OnInit,
  TemplateRef,
  ViewChild,
} from "@angular/core";
import { Title } from "@angular/platform-browser";
import { Router } from "@angular/router";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { MatomoTracker } from "ngx-matomo";
import { ToastrService } from "ngx-toastr";
import { fromEvent, ReplaySubject, Subject, Subscription } from "rxjs";
import { debounceTime, distinctUntilChanged, map } from "rxjs/operators";
import { AuthService } from "src/app/modules/shared/services/auth.service";
import { Usager } from "src/app/modules/usagers/interfaces/usager";
import { UsagerService } from "src/app/modules/usagers/services/usager.service";
import { fadeInOut, fadeInOutSlow } from "src/app/shared/animations";
import { Structure } from "../../../structures/structure.interface";
import { interactionsLabels } from "../../interactions.labels";
import { InteractionTypes } from "../../interfaces/interaction";
import {
  Filters,
  Search,
  SearchStatut,
  SortValues,
} from "../../interfaces/search";
import { InteractionService } from "../../services/interaction.service";

@Component({
  animations: [fadeInOutSlow, fadeInOut],
  providers: [UsagerService],
  selector: "app-manage-usagers",
  styleUrls: ["./manage.css"],
  templateUrl: "./manage.html",
})
export class ManageUsagersComponent implements OnInit, OnDestroy {
  public searching: boolean;
  public usagers: Usager[] = [];
  public dateLabel: string;
  public today: Date;
  public labelsDateFin: any = {
    ATTENTE_DECISION: "Demande effectuée le",
    INSTRUCTION: "Dossier débuté le",
    RADIE: "Radié le ",
    REFUS: "Date de refus",
    TOUS: "Fin de domiciliation",
    VALIDE: "Fin de domiciliation",
  };

  public searchString = "";
  public filters: Search;
  public filters$: Subject<Search> = new ReplaySubject(1);

  public nbResults: number;

  public stats: {
    INSTRUCTION: number;
    VALIDE: number;
    ATTENTE_DECISION: number;
    REFUS: number;
    RADIE: number;
    TOUS: number;
  };

  public sortLabels = {
    NAME: "nom",
    ATTENTE_DECISION: "demande effectuée le",
    INSTRUCTION: "dossier débuté le",
    RADIE: "radié le ",
    REFUS: "date de refus",
    TOUS: "fin de domiciliation",
    VALIDE: "fin de domiciliation",
    PASSAGE: "date de dernier passage",
    ID: "ID",
  };

  public structure: Structure;
  public selectedUsager: Usager;

  @ViewChild("searchInput", { static: true })
  public searchInput!: ElementRef;

  @ViewChild("distributionConfirm", { static: true })
  public distributionConfirm!: TemplateRef<any>;

  private subscription = new Subscription();

  constructor(
    private usagerService: UsagerService,
    private interactionService: InteractionService,
    public authService: AuthService,
    public modalService: NgbModal,
    private router: Router,
    private notifService: ToastrService,
    private titleService: Title,
    private matomo: MatomoTracker
  ) {
    this.usagers = [];
    this.searching = true;
    this.dateLabel = "Fin de domiciliation";
    this.filters = new Search(this.getFilters());
    this.nbResults = 0;
    this.selectedUsager = new Usager();
    this.structure =
      this.authService.currentUserValue !== null
        ? this.authService.currentUserValue.structure
        : new Structure();
    this.today = new Date();
    this.stats = {
      INSTRUCTION: 0,
      VALIDE: 0,
      ATTENTE_DECISION: 0,
      REFUS: 0,
      RADIE: 0,
      TOUS: 0,
    };
  }

  public ngOnInit() {
    this.titleService.setTitle("Gérer vos domiciliés");

    this.searchString = this.filters.name;
    this.filters.page = 0;
    this.filters$.next(this.filters);

    this.getStats();

    this.subscription.add(
      fromEvent(this.searchInput.nativeElement, "keyup")
        .pipe(
          map((event: any) => {
            return event.target.value;
          }),
          debounceTime(400),
          map((filter) => (!filter ? filter : filter.trim())),
          distinctUntilChanged()
        )
        .subscribe((text: any) => {
          this.filters.name = text;
          this.filters.page = 0;
          this.filters$.next(this.filters);
        })
    );

    this.subscription.add(
      this.filters$.subscribe((filters) => {
        this.search(filters);
      })
    );
  }

  public ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  public resetSearchBar() {
    this.searchInput.nativeElement.value = "";
    this.filters.name = "";
    this.filters$.next(this.filters);
  }

  public getAttestation(usagerId: number) {
    return this.usagerService.attestation(usagerId);
  }

  public resetFilters() {
    this.filters = new Search();
    this.filters$.next(this.filters);
  }

  public updateFilters<T extends Filters>(
    element: T,
    value: Search[T] | null,
    sortValue?: SortValues
  ) {
    if (
      element === "interactionType" ||
      element === "passage" ||
      element === "echeance"
    ) {
      const newValue = this.filters[element] === value ? null : value;
      this.filters[element] = newValue;
      this.filters.sortKey = "NAME";
      this.filters.sortValue = "ascending";
    } else if (element === "statut") {
      if (this.filters[element] === value) {
        return;
      }

      this.filters[element] = value;
      // Si le tri actuel est lié sur le statut
      if (
        this.filters.sortKey !== "NAME" &&
        this.filters.sortKey !== "ID" &&
        this.filters.sortKey !== "PASSAGE"
      ) {
        this.filters.sortKey = value;
      }

      if (value !== "TOUS" && value !== "VALIDE") {
        this.filters.passage = null;
        this.filters.echeance = null;
        this.filters.interactionType = null;
        this.filters.sortKey = "NAME";
        this.filters.sortValue = "ascending";
      }
    } else if (element === "sortKey") {
      if (this.filters.statut === "TOUS" && value === "VALIDE") {
        return;
      }

      // Tri issu des en-tête de tableau
      if (!sortValue) {
        sortValue =
          value === this.filters.sortKey
            ? this.filters.sortValue === "ascending"
              ? "descending"
              : "ascending"
            : "ascending";
      }

      this.filters.sortValue = sortValue;
      this.filters.sortKey = value;
    } else {
      this.filters[element] = value;
    }

    this.filters.page = 0;
    this.filters$.next(this.filters);
  }

  public goToProfil(usager: Usager) {
    const etapesUrl = [
      "etat-civil",
      "rendez-vous",
      "entretien",
      "documents",
      "decision",
    ];

    if (
      usager.decision.statut === "ATTENTE_DECISION" ||
      usager.decision.statut === "INSTRUCTION"
    ) {
      if (usager.typeDom === "RENOUVELLEMENT") {
        this.router.navigate(["usager/" + usager.id]);
        return;
      }

      if (this.authService.currentUserValue.role === "facteur") {
        this.notifService.error("Vous ne pouvez pas accéder à ce profil");
        return;
      }

      if (usager.decision.statut === "INSTRUCTION") {
        this.router.navigate([
          "usager/" + usager.id + "/edit/" + etapesUrl[usager.etapeDemande],
        ]);
      } else {
        this.router.navigate(["usager/" + usager.id + "/edit/decision"]);
      }
    } else {
      this.router.navigate(["usager/" + usager.id]);
    }
  }

  public setInteraction(
    usager: Usager,
    type: InteractionTypes,
    procuration?: boolean
  ) {
    const interaction: {
      content?: string;
      type?: string;
      procuration?: boolean;
      transfert?: boolean;
    } = {
      content: "",
      type,
    };

    if (type === "courrierOut" && usager.options.procuration.actif) {
      if (typeof procuration === "undefined") {
        this.selectedUsager = usager;
        this.modalService.open(this.distributionConfirm);
        // open
        return;
      }
      this.modalService.dismissAll();
      interaction.procuration = procuration;
    }

    if (type === "courrierOut" && usager.options.transfert.actif) {
      interaction.transfert = true;
    }

    this.matomo.trackEvent("interactions", "manage", type, 1);

    this.interactionService.setInteraction(usager, interaction).subscribe(
      (response: Usager) => {
        usager.lastInteraction = response.lastInteraction;
        this.notifService.success(interactionsLabels[type]);
      },
      (error) => {
        this.notifService.error("Impossible d'enregistrer cette interaction");
      }
    );
  }

  public getStats() {
    this.usagerService.getStats().subscribe((stats: any) => {
      this.stats = stats;
    });
  }

  public search(filters: Search) {
    this.searching = true;

    this.dateLabel = this.labelsDateFin[filters.statut];

    localStorage.setItem("filters", JSON.stringify(filters));

    this.usagerService.search(filters).subscribe(
      (response: { results: Usager[] | Usager; nbResults: number }) => {
        const usagers = Array.isArray(response.results)
          ? response.results.map((item) => new Usager(item, filters.name))
          : [new Usager(response, filters.name)];

        if (filters.page === 0) {
          this.nbResults = response.nbResults;
          this.usagers = usagers;

          window.scroll({
            behavior: "smooth",
            left: 0,
            top: 0,
          });
        } else {
          this.usagers = this.usagers.concat(usagers);
        }
        this.searching = false;
      },
      () => {
        this.searching = false;
        this.notifService.error("Une erreur a eu lieu lors de la recherche");
      }
    );
  }

  private getFilters() {
    const filters = localStorage.getItem("filters");
    return filters === null ? {} : JSON.parse(filters);
  }

  @HostListener("window:scroll", ["$event"])
  onScroll($event: Event): void {
    const pos =
      (document.documentElement.scrollTop || document.body.scrollTop) +
      document.documentElement.offsetHeight;
    const max = document.documentElement.scrollHeight;
    const pourcent = (pos / max) * 100;

    if (pourcent >= 80 && this.usagers.length < this.nbResults) {
      this.filters.page = this.filters.page + 1;
      this.filters$.next(this.filters);
    }
  }
}
