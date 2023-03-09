import { Router } from "@angular/router";
import { Subscription } from "rxjs";
import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  TemplateRef,
  ViewChild,
} from "@angular/core";
import {
  NgbModal,
  NgbModalOptions,
  NgbModalRef,
} from "@ng-bootstrap/ng-bootstrap";
import { MatomoTracker } from "@ngx-matomo/tracker";

import { UserStructure, UsagerLight } from "../../../../../_common/model";
import {
  InteractionType,
  InteractionInForApi,
} from "../../../../../_common/model/interaction";
import { INTERACTIONS_LABELS_SINGULIER } from "../../../../../_common/model/interaction/constants";
import { fadeInOut } from "../../../../shared";
import { CustomToastService } from "../../../shared/services/custom-toast.service";
import { UsagerFormModel } from "../../../usager-shared/interfaces";
import { InteractionService } from "../../../usager-shared/services/interaction.service";

import {
  UsagersFilterCriteria,
  UsagersFilterCriteriaSortValues,
  UsagersFilterCriteriaDernierPassage,
} from "../usager-filter";

@Component({
  animations: [fadeInOut],
  selector: "app-manage-manage-usagers-table",
  styleUrls: ["./manage-usagers-table.scss"],
  templateUrl: "./manage-usagers-table.html",
})
export class ManageUsagersTableComponent implements OnInit, OnDestroy {
  @Input()
  public me!: UserStructure | null;

  @Input()
  public usagers!: UsagerFormModel[];

  @Input()
  public filters!: UsagersFilterCriteria;

  @Input()
  public loading!: boolean;

  @Output()
  public updateUsager = new EventEmitter<UsagerLight>();

  @Output()
  public goToPrint = new EventEmitter<void>();

  @Output()
  public updateFilters = new EventEmitter<{
    element: keyof UsagersFilterCriteria;
    value: UsagersFilterCriteria[keyof UsagersFilterCriteria] | null;
    sortValue?: UsagersFilterCriteriaSortValues;
  }>();

  public readonly modalOptions: NgbModalOptions = {
    backdrop: "static",
    keyboard: false,
  };

  public today: Date;
  private subscription = new Subscription();

  public selectedUsager: UsagerFormModel | null;

  @ViewChild("setInteractionInModal")
  public setInteractionInModal!: TemplateRef<NgbModalRef>;

  @ViewChild("setInteractionOutModal")
  public setInteractionOutModal!: TemplateRef<NgbModalRef>;

  public loadingButtons: string[];

  public readonly labelsDernierPassage: {
    [key in UsagersFilterCriteriaDernierPassage]: string;
  } = {
    DEUX_MOIS: "Dernier passage 2 mois",
    TROIS_MOIS: "Dernier passage 3 mois",
  };
  constructor(
    private readonly interactionService: InteractionService,
    private readonly router: Router,
    private readonly modalService: NgbModal,
    private readonly toastService: CustomToastService,
    private readonly matomo: MatomoTracker
  ) {
    this.today = new Date();
    this.selectedUsager = null;
    this.loadingButtons = [];
    this.usagers = [];
  }

  public ngOnInit(): void {
    this.selectedUsager = {} as UsagerFormModel;
  }

  public setSingleInteraction(
    usager: UsagerFormModel,
    type: InteractionType
  ): void {
    // Ajout du loading du bouton
    const loadingRef = usager.ref.toString() + "_" + type;

    if (this.loadingButtons.indexOf(loadingRef) !== -1) {
      this.toastService.warning("Veuillez patienter quelques instants");
      return;
    }

    this.loadingButtons.push(loadingRef);

    const interaction: InteractionInForApi = {
      type,
      nbCourrier: 1,
      content: null,
    };

    const interactionType: { [key: string]: string } = {
      visite: "Liste_Icône_Réception",
      appel: "Liste_Icône_Appel",
      courrierIn: "Liste_Icône_Courrier",
    };

    this.matomo.trackEvent("MANAGE_USAGERS", "click", interactionType[type], 1);

    this.subscription.add(
      this.interactionService
        .setInteractionIn(usager.ref, [interaction])
        .subscribe({
          next: (newUsager: UsagerLight) => {
            this.updateUsager.emit(newUsager);
            this.toastService.success(INTERACTIONS_LABELS_SINGULIER[type]);
            this.stopLoading(loadingRef);
          },
          error: () => {
            this.toastService.error(
              "Impossible d'enregistrer cette interaction"
            );
            this.stopLoading(loadingRef);
          },
        })
    );
  }

  private stopLoading(loadingRef: string) {
    const index = this.loadingButtons.indexOf(loadingRef);
    if (index !== -1) {
      this.loadingButtons.splice(index, 1);
    }
  }

  public openInteractionInModal(usager: UsagerFormModel) {
    this.selectedUsager = usager;
    this.modalService.open(this.setInteractionInModal, this.modalOptions);
    this.matomo.trackEvent(
      "MANAGE_USAGERS",
      "click",
      "Liste_Icône_Réception",
      1
    );
  }

  public openInteractionOutModal(usager: UsagerFormModel) {
    this.selectedUsager = usager;
    this.modalService.open(this.setInteractionOutModal, this.modalOptions);
    this.matomo.trackEvent(
      "MANAGE_USAGERS",
      "click",
      "Liste_Icône_Distribution",
      1
    );
  }

  public goToProfil(usager: UsagerFormModel): void {
    this.router.navigate([usager.usagerProfilUrl]);
  }

  public cancelReception() {
    this.modalService.dismissAll();
  }

  public ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}