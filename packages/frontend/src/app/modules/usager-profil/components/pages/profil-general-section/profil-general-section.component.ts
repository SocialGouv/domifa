import { Component, TemplateRef, ViewChild } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { ActivatedRoute, Router } from "@angular/router";
import {
  NgbDateStruct,
  NgbModal,
  NgbModalRef,
} from "@ng-bootstrap/ng-bootstrap";
import { CustomToastService } from "src/app/modules/shared/services/custom-toast.service";
import { UsagerLight } from "../../../../../../_common/model";
import {
  InteractionInForApi,
  InteractionType,
} from "../../../../../../_common/model/interaction";
import { INTERACTIONS_LABELS_SINGULIER } from "../../../../../../_common/model/interaction/constants";
import {
  ETAPES_DEMANDE_URL,
  USAGER_DECISION_STATUT_LABELS,
} from "../../../../../../_common/model/usager/_constants";
import {
  minDateNaissance,
  formatDateToNgb,
} from "../../../../../shared/bootstrap-util";
import { AuthService } from "../../../../shared/services/auth.service";
import {
  Interaction,
  UsagerFormModel,
} from "../../../../usager-shared/interfaces";
import { InteractionService } from "../../../../usager-shared/services/interaction.service";
import { UsagerProfilService } from "../../../services/usager-profil.service";
import { ProfilGeneralHistoriqueCourriersComponent } from "../../profil-general-historique-courriers/profil-general-historique-courriers.component";
import { BaseUsagerProfilPageComponent } from "../base-usager-profil-page/base-usager-profil-page.component";

@Component({
  selector: "app-profil-general-section",
  templateUrl: "./profil-general-section.component.html",
  styleUrls: ["./profil-general-section.component.css"],
})
export class ProfilGeneralSectionComponent extends BaseUsagerProfilPageComponent {
  public interactions: Interaction[];

  public today: Date;

  public readonly ETAPES_DEMANDE_URL = ETAPES_DEMANDE_URL;
  public minDateNaissance: NgbDateStruct;
  public maxDateNaissance: NgbDateStruct;

  @ViewChild("distributionConfirm", { static: true })
  public distributionConfirm!: TemplateRef<NgbModalRef>;

  @ViewChild("setInteractionInModal", { static: true })
  public setInteractionInModal!: TemplateRef<NgbModalRef>;

  @ViewChild("setInteractionOutModal", { static: true })
  public setInteractionOutModal!: TemplateRef<NgbModalRef>;

  @ViewChild(ProfilGeneralHistoriqueCourriersComponent)
  private profileComponent!: ProfilGeneralHistoriqueCourriersComponent;

  public USAGER_DECISION_STATUT_LABELS = USAGER_DECISION_STATUT_LABELS;

  public loadingButtons: string[];

  constructor(
    public authService: AuthService,
    public usagerProfilService: UsagerProfilService,
    public titleService: Title,
    public toastService: CustomToastService,
    public route: ActivatedRoute,
    public router: Router,
    private readonly modalService: NgbModal,
    private readonly interactionService: InteractionService
  ) {
    super(
      authService,
      usagerProfilService,
      titleService,
      toastService,
      route,
      router
    );
    this.loadingButtons = [];
    this.interactions = [];

    this.minDateNaissance = minDateNaissance;
    this.maxDateNaissance = formatDateToNgb(new Date()) as NgbDateStruct;

    this.today = new Date();
    this.titlePrefix = "Dossier";
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
}
