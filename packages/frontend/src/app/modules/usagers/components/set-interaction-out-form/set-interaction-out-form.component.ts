import { UsagerFormModel } from "../form/UsagerFormModel";
import { UsagerLight } from "../../../../../_common/model/usager/UsagerLight.type";
import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import {
  InteractionIn,
  InteractionOutForm,
  INTERACTIONS_AVAILABLE,
} from "../../../../../_common/model/interaction";

import { InteractionService } from "../../services/interaction.service";
import { ToastrService } from "ngx-toastr";
import { forkJoin } from "rxjs";
import { UsagerService } from "../../services/usager.service";

@Component({
  selector: "app-set-interaction-out-form",
  templateUrl: "./set-interaction-out-form.component.html",
  styleUrls: ["./set-interaction-out-form.component.css"],
})
export class SetInteractionOutFormComponent implements OnInit {
  @Input() public usager: UsagerFormModel;

  @Output()
  public cancelReception = new EventEmitter<void>();

  @Output()
  public usagerChange = new EventEmitter<UsagerFormModel>();

  public interactionFormData: InteractionOutForm;

  constructor(
    private interactionService: InteractionService,
    private usagerService: UsagerService,
    private notifService: ToastrService
  ) {
    this.interactionFormData = {
      courrierOut: {
        nbCourrier: 0,
        procuration: false,
        selected: true,
      },
      recommandeOut: {
        nbCourrier: 0,
        procuration: false,
        selected: true,
      },
      colisOut: {
        nbCourrier: 0,
        procuration: false,
        selected: true,
      },
    };
  }

  public ngOnInit(): void {
    this.interactionFormData.courrierOut.nbCourrier = this.usager.lastInteraction.courrierIn;
    this.interactionFormData.recommandeOut.nbCourrier = this.usager.lastInteraction.recommandeIn;
    this.interactionFormData.colisOut.nbCourrier = this.usager.lastInteraction.colisIn;
  }

  // Ajout de courrier / colis / recommandé entrant
  public setInteractionOut(usager: UsagerFormModel) {
    this.interactionService
      .setInteraction(usager, this.interactionFormData)
      .subscribe(
        (response: UsagerLight) => {
          usager = new UsagerFormModel(response);

          // this.notifService.success(interactionsLabels[type]);
        },
        (error) => {
          this.notifService.error("Impossible d'enregistrer cette interaction");
        }
      );
  }

  public setInteractionForm() {
    const interactionsToSave = INTERACTIONS_AVAILABLE.reduce(
      (filtered, interaction) => {
        if (this.interactionFormData[interaction].nbCourrier > 0) {
          filtered.push(
            this.interactionService.setInteraction(this.usager, {
              content: this.interactionFormData[interaction].content,
              nbCourrier: this.interactionFormData[interaction].nbCourrier,
              type: interaction,
            })
          );
        }
        return filtered;
      },
      []
    );

    if (interactionsToSave.length === 0) {
      this.cancelReception.emit();
      return;
    }

    const joined$ = forkJoin(interactionsToSave);

    joined$.subscribe(
      (values: any) => {
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
