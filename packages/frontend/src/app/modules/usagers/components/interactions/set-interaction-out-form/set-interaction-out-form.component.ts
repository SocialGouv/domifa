import { Component, OnInit, Input, Output, EventEmitter } from "@angular/core";
import { ToastrService } from "ngx-toastr";
import { UsagerLight } from "../../../../../../_common/model";
import {
  InteractionOutForm,
  INTERACTIONS_OUT_AVAILABLE,
  InteractionIn,
} from "../../../../../../_common/model/interaction";
import { bounce } from "../../../../../shared/animations";
import { InteractionService } from "../../../services/interaction.service";
import { UsagerService } from "../../../services/usager.service";
import { UsagerFormModel } from "../../form/UsagerFormModel";

@Component({
  animations: [bounce],
  selector: "app-set-interaction-out-form",
  templateUrl: "./set-interaction-out-form.component.html",
  styleUrls: ["../interactions.css"],
})
export class SetInteractionOutFormComponent implements OnInit {
  @Input() public usager: UsagerFormModel;

  @Output()
  public cancelReception = new EventEmitter<void>();

  @Output()
  public usagerChange = new EventEmitter<UsagerFormModel>();

  public interactionFormData: InteractionOutForm;
  public procuration: boolean; // Mandataire = true / domicilié = false

  constructor(
    private interactionService: InteractionService,
    private usagerService: UsagerService,
    private notifService: ToastrService
  ) {
    this.procuration = false;
    this.interactionFormData = {
      courrierOut: {
        nbCourrier: 0,
        procuration: false,
        selected: false,
      },
      recommandeOut: {
        nbCourrier: 0,
        procuration: false,
        selected: false,
      },
      colisOut: {
        nbCourrier: 0,
        procuration: false,
        selected: false,
      },
    };
  }

  public ngOnInit(): void {
    this.interactionFormData.courrierOut.nbCourrier = this.usager.lastInteraction.courrierIn;
    this.interactionFormData.recommandeOut.nbCourrier = this.usager.lastInteraction.recommandeIn;
    this.interactionFormData.colisOut.nbCourrier = this.usager.lastInteraction.colisIn;

    this.interactionFormData.courrierOut.selected =
      this.usager.lastInteraction.courrierIn > 0;
    this.interactionFormData.recommandeOut.selected =
      this.usager.lastInteraction.recommandeIn > 0;
    this.interactionFormData.colisOut.selected =
      this.usager.lastInteraction.colisIn > 0;
  }

  public setInteractionForm() {
    const interactionsToSave = INTERACTIONS_OUT_AVAILABLE.reduce(
      (filtered, interaction) => {
        if (this.interactionFormData[interaction].selected) {
          filtered.push({
            procuration: this.procuration,
            nbCourrier: this.interactionFormData[interaction].nbCourrier,
            type: interaction,
          });
        }
        return filtered;
      },
      []
    );

    if (interactionsToSave.length === 0) {
      this.cancelReception.emit();
      return;
    }

    this.interactionService
      .setInteraction(this.usager, interactionsToSave)
      .subscribe(
        (values: any) => {
          this.notifService.success("Distribution effectuée avec succès");
          this.refreshUsager();
        },
        () => {
          this.notifService.error("Impossible d'enregistrer cette interaction");
        }
      );
  }

  // Actualiser les données de l'usager
  public refreshUsager() {
    this.usagerService
      .findOne(this.usager.ref)
      .subscribe((usager: UsagerLight) => {
        this.usagerChange.emit(new UsagerFormModel(usager));
        this.cancelReception.emit();
      });
  }

  public increment(value: InteractionIn) {
    this.interactionFormData[value].nbCourrier = this.interactionFormData[
      value
    ].nbCourrier = this.interactionFormData[value].nbCourrier + 1;
  }

  public decrement(value: InteractionIn) {
    this.interactionFormData[value].nbCourrier = this.interactionFormData[
      value
    ].nbCourrier = this.interactionFormData[value].nbCourrier - 1;
  }
}
