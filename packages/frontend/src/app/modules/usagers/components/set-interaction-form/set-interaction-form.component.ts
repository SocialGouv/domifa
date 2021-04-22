import { UsagerFormModel } from "./../form/UsagerFormModel";
import { UsagerLight } from "./../../../../../_common/model/usager/UsagerLight.type";
import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import {
  InteractionIn,
  InteractionInForm,
  InteractionType,
} from "../../../../../_common/model/interaction";
import { interactionsLabels } from "../../interactions.labels";
import { InteractionService } from "../../services/interaction.service";
import { ToastrService } from "ngx-toastr";

@Component({
  selector: "app-set-interaction-form",
  templateUrl: "./set-interaction-form.component.html",
  styleUrls: ["./set-interaction-form.component.css"],
})
export class SetInteractionFormComponent implements OnInit {
  @Input() public usager: UsagerFormModel;

  @Output()
  public cancelReception = new EventEmitter<void>();

  public interactionFormData: InteractionInForm;

  constructor(
    private interactionService: InteractionService,
    private notifService: ToastrService
  ) {
    this.interactionFormData = {
      courrierIn: 0,
      recommandeIn: 0,
      colisIn: 0,
    };
  }

  public ngOnInit(): void {}

  // Ajout de courrier / colis / recommandé entrant
  public setInteractionIn(usager: UsagerFormModel) {
    this.interactionService
      .setInteractionIN(usager, this.interactionFormData)
      .subscribe(
        (response: UsagerLight) => {
          usager.lastInteraction = response.lastInteraction;
          // this.updateUsager(usager);
          // this.notifService.success(interactionsLabels[type]);
        },
        (error) => {
          this.notifService.error("Impossible d'enregistrer cette interaction");
        }
      );
  }

  public increment(value: InteractionIn) {
    this.interactionFormData[value] = this.interactionFormData[value] =
      this.interactionFormData[value] + 1;
  }
  public decrement(value: InteractionIn) {
    this.interactionFormData[value] = this.interactionFormData[value] =
      this.interactionFormData[value] - 1;
  }
}
