import {
  Component,
  OnDestroy,
  OnInit,
  TemplateRef,
  ViewChild,
} from "@angular/core";
import { Title } from "@angular/platform-browser";
import { ActivatedRoute, Router } from "@angular/router";
import {
  NgbDateStruct,
  NgbModal,
  NgbModalRef,
} from "@ng-bootstrap/ng-bootstrap";
import { Subscription } from "rxjs";
import { CustomToastService } from "src/app/modules/shared/services/custom-toast.service";
import {
  UserStructure,
  UserStructureRole,
  UsagerLight,
} from "../../../../../_common/model";
import {
  InteractionInForApi,
  InteractionType,
} from "../../../../../_common/model/interaction";
import { INTERACTIONS_LABELS_SINGULIER } from "../../../../../_common/model/interaction/constants";
import {
  ETAPES_DEMANDE_URL,
  USAGER_DECISION_STATUT_LABELS,
} from "../../../../../_common/model/usager/_constants";
import {
  minDateNaissance,
  formatDateToNgb,
} from "../../../../shared/bootstrap-util";
import { getUsagerNomComplet } from "../../../../shared/getUsagerNomComplet";
import { AuthService } from "../../../shared/services/auth.service";
import {
  Interaction,
  UsagerFormModel,
} from "../../../usager-shared/interfaces";
import { InteractionService } from "../../../usager-shared/services/interaction.service";
import { UsagerProfilService } from "../../services/usager-profil.service";
import { ProfilGeneralHistoriqueCourriersComponent } from "../profil-general-historique-courriers/profil-general-historique-courriers.component";

@Component({
  selector: "app-profil-general-section",
  templateUrl: "./profil-general-section.component.html",
  styleUrls: ["./profil-general-section.component.css"],
})
export class ProfilGeneralSectionComponent implements OnInit, OnDestroy {
  public interactions: Interaction[];

  public readonly actions = {
    EDIT: "Modification",
    DELETE: "Suppression",
    CREATION: "Création",
  };

  public usager!: UsagerFormModel;
  public today: Date;
  public me!: UserStructure | null;

  public readonly ETAPES_DEMANDE_URL = ETAPES_DEMANDE_URL;
  public minDateNaissance: NgbDateStruct;
  public maxDateNaissance: NgbDateStruct;

  @ViewChild("distributionConfirm", { static: true })
  public distributionConfirm!: TemplateRef<NgbModalRef>;

  @ViewChild("addNoteInModal", { static: true })
  public addNoteInModal!: TemplateRef<NgbModalRef>;

  @ViewChild("setInteractionInModal", { static: true })
  public setInteractionInModal!: TemplateRef<NgbModalRef>;

  @ViewChild("setInteractionOutModal", { static: true })
  public setInteractionOutModal!: TemplateRef<NgbModalRef>;

  @ViewChild(ProfilGeneralHistoriqueCourriersComponent)
  private profileComponent!: ProfilGeneralHistoriqueCourriersComponent;

  public USAGER_DECISION_STATUT_LABELS = USAGER_DECISION_STATUT_LABELS;

  public loadingButtons: string[];
  private subscription = new Subscription();

  constructor(
    private readonly authService: AuthService,
    private readonly modalService: NgbModal,
    private readonly toastService: CustomToastService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly usagerProfilService: UsagerProfilService,
    private readonly titleService: Title,
    private readonly interactionService: InteractionService
  ) {
    this.loadingButtons = [];
    this.interactions = [];

    this.minDateNaissance = minDateNaissance;
    this.maxDateNaissance = formatDateToNgb(new Date()) as NgbDateStruct;

    this.today = new Date();
  }

  public isRole(role: UserStructureRole): boolean {
    return this.me?.role === role;
  }

  public ngOnInit(): void {
    this.me = this.authService.currentUserValue;

    if (!this.route.snapshot.params.id) {
      this.router.navigate(["/404"]);
      return;
    }
    this.subscription.add(
      this.usagerProfilService
        .findOne(this.route.snapshot.params.id)
        .subscribe({
          next: (usager: UsagerLight) => {
            this.usager = new UsagerFormModel(usager);
            const name = getUsagerNomComplet(usager);
            this.titleService.setTitle("Fiche de " + name);
          },
          error: () => {
            this.toastService.error("Le dossier recherché n'existe pas");
            this.router.navigate(["404"]);
          },
        })
    );
  }

  public setSingleInteraction(usagerRef: number, type: InteractionType): void {
    const interaction: InteractionInForApi = {
      type,
      nbCourrier: 1,
      content: null,
    };

    if (this.loadingButtons.indexOf(type) !== -1) {
      this.toastService.warning("Veuillez patienter quelques instants");
      return;
    }

    this.loadingButtons.push(type);
    this.subscription.add(
      this.interactionService
        .setInteractionIn(usagerRef, [interaction])
        .subscribe({
          next: (newUsager: UsagerLight) => {
            this.usager = new UsagerFormModel(newUsager);
            this.toastService.success(INTERACTIONS_LABELS_SINGULIER[type]);
            this.updateInteractions();
            this.stopLoading(type);
          },
          error: () => {
            this.toastService.error(
              "Impossible d'enregistrer cette interaction"
            );
            this.stopLoading(type);
          },
        })
    );
  }

  public stopCourrier(): void {
    this.subscription.add(
      this.usagerProfilService.stopCourrier(this.usager.ref).subscribe({
        next: () => {
          this.setSingleInteraction(this.usager.ref, "npai");
        },
        error: () => {
          this.toastService.error("Impossible d'enregistrer cette interaction");
        },
      })
    );
  }

  public updateInteractions(): void {
    this.profileComponent.getInteractions();
  }

  public closeModals(): void {
    this.modalService.dismissAll();
  }

  public openAddNoteInModal(): void {
    this.modalService.open(this.addNoteInModal);
  }

  public openInteractionInModal(): void {
    this.modalService.open(this.setInteractionInModal);
  }

  public openInteractionOutModal(): void {
    this.modalService.open(this.setInteractionOutModal);
  }

  private stopLoading(loadingRef: string) {
    const index = this.loadingButtons.indexOf(loadingRef);
    if (index !== -1) {
      this.loadingButtons.splice(index, 1);
    }
  }

  public ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
