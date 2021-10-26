import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  TemplateRef,
  ViewChild,
} from "@angular/core";
import { NgbModal, NgbModalOptions } from "@ng-bootstrap/ng-bootstrap";
import { MatomoTracker } from "ngx-matomo";
import { ToastrService } from "ngx-toastr";
import {
  UserStructure,
  UsagerLight,
  UsagerOptionsProcuration,
  UsagerOptionsTransfert,
} from "../../../../../../_common/model";
import {
  InteractionType,
  InteractionForApi,
} from "../../../../../../_common/model/interaction";
import { INTERACTIONS_LABELS_SINGULIER } from "../../../../../../_common/model/interaction/constants";
import { fadeInOutSlow, fadeInOut } from "../../../../../shared";
import { UsagerFormModel } from "../../../../usager-shared/interfaces";
import { InteractionService } from "../../../../usager-shared/services/interaction.service";
import {
  isProcurationActifMaintenant,
  isTransfertActifMaintenant,
} from "../../../services";
import {
  UsagersFilterCriteria,
  UsagersFilterCriteriaSortValues,
  UsagersFilterCriteriaDernierPassage,
} from "../usager-filter";

@Component({
  animations: [fadeInOutSlow, fadeInOut],
  selector: "app-manage-manage-usagers-table",
  styleUrls: ["./manage-usagers-table.css"],
  templateUrl: "./manage-usagers-table.html",
})
export class ManageUsagersTableComponent implements OnInit {
  @Input()
  public me: UserStructure;

  @Input()
  public usagers: UsagerFormModel[];

  @Input()
  public filters: UsagersFilterCriteria;

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

  public modalOptions: NgbModalOptions = {
    backdrop: "static",
    keyboard: false,
  };

  public today: Date;

  public labelsDernierPassage: {
    [key in UsagersFilterCriteriaDernierPassage]: string;
  } = {
    DEUX_MOIS: "Dernier passage 2 mois",
    TROIS_MOIS: "Dernier passage 3 mois",
  };

  public selectedUsager: UsagerFormModel;

  @ViewChild("setInteractionInModal")
  public setInteractionInModal!: TemplateRef<any>;

  @ViewChild("setInteractionOutModal")
  public setInteractionOutModal!: TemplateRef<any>;

  public loadingButtons: string[];

  constructor(
    private interactionService: InteractionService,
    private modalService: NgbModal,
    private notifService: ToastrService,
    private matomo: MatomoTracker
  ) {
    this.loadingButtons = [];
  }

  public ngOnInit(): void {
    this.selectedUsager = {} as UsagerFormModel;
    this.today = new Date();
  }

  public isProcurationActifMaintenant(procuration: UsagerOptionsProcuration) {
    return isProcurationActifMaintenant(procuration);
  }

  public isTransfertActifMaintenant(transfert: UsagerOptionsTransfert) {
    return isTransfertActifMaintenant(transfert);
  }

  public setSingleInteraction(
    usager: UsagerFormModel,
    type: InteractionType
  ): void {
    // Ajout du loading du bouton
    const loadingRef = usager.ref.toString() + "_" + type;

    if (this.loadingButtons.indexOf(loadingRef) !== -1) {
      this.notifService.warning("Veuillez patienter quelques instants");
      return;
    }

    this.loadingButtons.push(loadingRef);

    const interaction: InteractionForApi = {
      type,
      nbCourrier: 1,
    };

    const interactionType: { [key: string]: string } = {
      visite: "Liste_Icône_Réception",
      appel: "Liste_Icône_Appel",
      courrierIn: "Liste_Icône_Courrier",
    };

    this.matomo.trackEvent("MANAGE_USAGERS", "click", interactionType[type], 1);

    this.interactionService
      .setInteraction(usager.ref, [interaction])
      .subscribe({
        next: (newUsager: UsagerLight) => {
          usager = new UsagerFormModel(newUsager);
          this.updateUsager.emit(usager);
          this.notifService.success(INTERACTIONS_LABELS_SINGULIER[type]);
          this.stopLoading(loadingRef);
        },
        error: () => {
          this.notifService.error("Impossible d'enregistrer cette interaction");
          this.stopLoading(loadingRef);
        },
      });
  }

  private stopLoading(loadingRef: string) {
    var index = this.loadingButtons.indexOf(loadingRef);
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

  public cancelReception() {
    this.modalService.dismissAll();
  }
}
