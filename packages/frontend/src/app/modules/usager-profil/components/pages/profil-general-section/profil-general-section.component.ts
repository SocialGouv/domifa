import { Component, ViewChild } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { ActivatedRoute, Router } from "@angular/router";
import { NgbDateStruct } from "@ng-bootstrap/ng-bootstrap";
import { ProfilGeneralHistoriqueCourriersComponent } from "../../_general-section/profil-general-historique-courriers/profil-general-historique-courriers.component";
import { SetInteractionInFormComponent } from "../../../../usager-shared/components/interactions/set-interaction-in-form/set-interaction-in-form.component";
import { SetInteractionOutFormComponent } from "../../../../usager-shared/components/interactions/set-interaction-out-form/set-interaction-out-form.component";
import { BaseUsagerProfilPageComponent } from "../base-usager-profil-page/base-usager-profil-page.component";
import {
  ETAPES_DEMANDE_URL,
  InteractionInForApi,
} from "../../../../../../_common/model";
import {
  minDateNaissance,
  formatDateToNgb,
  UsagerState,
} from "../../../../../shared";
import { AuthService, CustomToastService } from "../../../../shared/services";
import { InteractionService } from "../../../../usager-shared/services/interaction.service";
import { UsagerProfilService } from "../../../services/usager-profil.service";
import { Store } from "@ngrx/store";
import {
  INTERACTIONS_LABELS_SINGULIER,
  USAGER_DECISION_STATUT_LABELS,
  InteractionType,
  Interaction,
} from "@domifa/common";

@Component({
  selector: "app-profil-general-section",
  templateUrl: "./profil-general-section.component.html",
  styleUrls: ["./profil-general-section.component.css"],
})
export class ProfilGeneralSectionComponent extends BaseUsagerProfilPageComponent {
  public interactions: Interaction[];

  public readonly ETAPES_DEMANDE_URL = ETAPES_DEMANDE_URL;
  public minDateNaissance: NgbDateStruct;
  public maxDateNaissance: NgbDateStruct;

  @ViewChild("interactionInRef")
  public interactionInRef!: SetInteractionInFormComponent;

  @ViewChild("interactionOutRef")
  public interactionOutRef!: SetInteractionOutFormComponent;

  @ViewChild(ProfilGeneralHistoriqueCourriersComponent)
  private readonly profileComponent!: ProfilGeneralHistoriqueCourriersComponent;

  public readonly USAGER_DECISION_STATUT_LABELS = USAGER_DECISION_STATUT_LABELS;

  public loadingButtons: string[];

  constructor(
    public authService: AuthService,
    public usagerProfilService: UsagerProfilService,
    public titleService: Title,
    public toastService: CustomToastService,
    public route: ActivatedRoute,
    public router: Router,
    public store: Store<UsagerState>,
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

    this.titlePrefix = "Dossier";
    this.section = "general";
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

  public closeModals(): void {}

  public openInteractionInModal(): void {
    this.interactionInRef.open();
  }

  public openInteractionOutModal(): void {
    this.interactionOutRef.open();
  }

  private stopLoading(loadingRef: string) {
    const index = this.loadingButtons.indexOf(loadingRef);
    if (index !== -1) {
      this.loadingButtons.splice(index, 1);
    }
  }
}
