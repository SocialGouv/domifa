import { Component, TemplateRef, ViewChild } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { ActivatedRoute, Router } from "@angular/router";
import {
  NgbDateStruct,
  NgbModal,
  NgbModalRef,
} from "@ng-bootstrap/ng-bootstrap";

import { ProfilGeneralHistoriqueCourriersComponent } from "../../_general-section/profil-general-historique-courriers/profil-general-historique-courriers.component";
import { BaseUsagerProfilPageComponent } from "../base-usager-profil-page/base-usager-profil-page.component";
import {
  ETAPES_DEMANDE_URL,
  InteractionInForApi,
  DEFAULT_MODAL_OPTIONS,
} from "../../../../../../_common/model";
import { minDateNaissance, formatDateToNgb } from "../../../../../shared";
import { AuthService, CustomToastService } from "../../../../shared/services";
import { Interaction } from "../../../../usager-shared/interfaces";
import { InteractionService } from "../../../../usager-shared/services/interaction.service";
import { UsagerProfilService } from "../../../services/usager-profil.service";
import { Store } from "@ngrx/store";
import {
  INTERACTIONS_LABELS_SINGULIER,
  USAGER_DECISION_STATUT_LABELS,
  InteractionType,
} from "@domifa/common";

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

  public readonly USAGER_DECISION_STATUT_LABELS = USAGER_DECISION_STATUT_LABELS;

  public loadingButtons: string[];

  constructor(
    public authService: AuthService,
    public usagerProfilService: UsagerProfilService,
    public titleService: Title,
    public toastService: CustomToastService,
    public route: ActivatedRoute,
    public router: Router,
    public store: Store,
    private readonly modalService: NgbModal,
    private readonly interactionService: InteractionService
  ) {
    super(
      authService,
      usagerProfilService,
      titleService,
      toastService,
      route,
      router,
      store
    );
    this.loadingButtons = [];
    this.interactions = [];

    this.minDateNaissance = minDateNaissance;
    this.maxDateNaissance = formatDateToNgb(new Date());

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
        .setInteraction(usagerRef, [interaction])
        .subscribe({
          next: () => {
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

  public updateInteractions(): void {
    this.profileComponent.getInteractions();
  }

  public closeModals(): void {
    this.modalService.dismissAll();
  }

  public openInteractionInModal(): void {
    this.modalService.open(this.setInteractionInModal, DEFAULT_MODAL_OPTIONS);
  }

  public openInteractionOutModal(): void {
    this.modalService.open(this.setInteractionOutModal, DEFAULT_MODAL_OPTIONS);
  }

  private stopLoading(loadingRef: string) {
    const index = this.loadingButtons.indexOf(loadingRef);
    if (index !== -1) {
      this.loadingButtons.splice(index, 1);
    }
  }
}
