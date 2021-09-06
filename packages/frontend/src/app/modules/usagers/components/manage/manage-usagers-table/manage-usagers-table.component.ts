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
import { fadeInOut, fadeInOutSlow } from "src/app/shared/animations";
import {
  AppUser,
  UsagerLight,
  UsagerOptionsProcuration,
  UsagerOptionsTransfert,
} from "../../../../../../_common/model";
import {
  InteractionForApi,
  InteractionType,
} from "../../../../../../_common/model/interaction";

import { INTERACTIONS_LABELS_SINGULIER } from "../../../../../../_common/model/interaction/constants";

import { isProcurationActifMaintenant } from "../../../services";
import { isTransfertActifMaintenant } from "../../../services/transfert.service";
import { InteractionService } from "../../../../usager-shared/services/interaction.service";

import { UsagerFormModel } from "../../form/UsagerFormModel";
import {
  UsagersFilterCriteria,
  UsagersFilterCriteriaDernierPassage,
  UsagersFilterCriteriaSortValues,
} from "../usager-filter";

@Component({
  animations: [fadeInOutSlow, fadeInOut],
  selector: "app-manage-manage-usagers-table",
  styleUrls: ["./manage-usagers-table.css"],
  templateUrl: "./manage-usagers-table.html",
})
export class ManageUsagersTableComponent implements OnInit {
  @Input()
  public me: AppUser;

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

  constructor(
    private interactionService: InteractionService,
    private modalService: NgbModal,
    private notifService: ToastrService,
    private matomo: MatomoTracker
  ) {}

  public ngOnInit() {
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
    const interaction: InteractionForApi = {
      type,
      nbCourrier: 1,
    };
    this.matomo.trackEvent("interactions", "manage", type, 1);
    this.interactionService
      .setInteraction(usager.ref, [interaction])
      .subscribe({
        next: (newUsager: UsagerLight) => {
          usager = new UsagerFormModel(newUsager);
          this.updateUsager.emit(usager);
          this.notifService.success(INTERACTIONS_LABELS_SINGULIER[type]);
        },
        error: () => {
          this.notifService.error("Impossible d'enregistrer cette interaction");
        },
      });
  }

  public openInteractionInModal(usager: UsagerFormModel) {
    this.selectedUsager = usager;
    this.modalService.open(this.setInteractionInModal, this.modalOptions);
  }

  public openInteractionOutModal(usager: UsagerFormModel) {
    this.selectedUsager = usager;
    this.modalService.open(this.setInteractionOutModal, this.modalOptions);
  }

  public cancelReception() {
    this.modalService.dismissAll();
  }
}
