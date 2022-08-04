import { InteractionInForApi } from "./../../../../../../_common/model/interaction/InteractionForApi.type";
import {
  Component,
  EventEmitter,
  HostListener,
  Input,
  OnInit,
  Output,
} from "@angular/core";
import { CustomToastService } from "src/app/modules/shared/services/custom-toast.service";
import { UsagerLight } from "../../../../../../_common/model";
import {
  InteractionIn,
  InteractionInForm,
} from "../../../../../../_common/model/interaction";
import { INTERACTIONS_IN_AVAILABLE } from "../../../../../../_common/model/interaction/constants";
import { bounce } from "../../../../../shared";
import { UsagerService } from "../../../../usagers/services/usager.service";
import { UsagerFormModel } from "../../../interfaces";
import { InteractionService } from "../../../services/interaction.service";

@Component({
  animations: [bounce],
  selector: "app-set-interaction-in-form",
  templateUrl: "./set-interaction-in-form.component.html",
  styleUrls: ["./set-interaction-in-form.component.css", "../interactions.css"],
})
export class SetInteractionInFormComponent {
  @Input() public usager!: UsagerFormModel;
  @Output()
  public usagerChange = new EventEmitter<UsagerFormModel>();

  @Output()
  public updateUsagerForManage = new EventEmitter<UsagerLight>();

  @Output()
  public cancelReception = new EventEmitter<void>();

  @Output()
  public updateInteractions = new EventEmitter<void>();

  public interactionFormData: InteractionInForm;

  public content: string | null;
  public loading = false;

  constructor(
    private readonly interactionService: InteractionService,
    private readonly usagerService: UsagerService,
    private readonly toastService: CustomToastService
  ) {
    this.interactionFormData = {
      courrierIn: {
        nbCourrier: 0,
        content: null,
      },
      recommandeIn: {
        nbCourrier: 0,
        content: null,
      },
      colisIn: {
        nbCourrier: 0,
        content: null,
      },
    };
    this.content = null;
  }

  public setInteractionForm(): void {
    const interactionsToSave: InteractionInForApi[] =
      INTERACTIONS_IN_AVAILABLE.reduce(
        (filtered: InteractionInForApi[], interaction) => {
          if (this.interactionFormData[interaction].nbCourrier > 0) {
            filtered.push({
              nbCourrier: this.interactionFormData[interaction].nbCourrier,
              type: interaction,
              content: this.content,
            });
          }
          return filtered;
        },
        []
      );

    if (interactionsToSave.length === 0) {
      this.toastService.warning(
        "Veuillez ajouter au moins un colis, courrier ou avis de passage"
      );

      this.loading = false;
      return;
    }

    this.loading = true;

    this.interactionService
      .setInteractionIn(this.usager.ref, interactionsToSave)
      .subscribe({
        next: () => {
          this.toastService.success("Réception enregistrée avec succès");
          setTimeout(() => {
            this.refreshUsager();
          }, 1000);
        },
        error: () => {
          this.toastService.error("Impossible d'enregistrer cette interaction");
          this.loading = false;
        },
      });
  }

  // Actualiser les données de l'usager
  public refreshUsager(): void {
    this.usagerService
      .findOne(this.usager.ref)
      .subscribe((usager: UsagerLight) => {
        this.updateUsagerForManage.emit(usager);
        this.usagerChange.emit(new UsagerFormModel(usager));
        this.cancelReception.emit();
        this.updateInteractions.emit();
      });
  }

  public increment(value: InteractionIn): void {
    this.interactionFormData[value].nbCourrier = this.interactionFormData[
      value
    ].nbCourrier = this.interactionFormData[value].nbCourrier + 1;
  }

  public decrement(value: InteractionIn): void {
    this.interactionFormData[value].nbCourrier = this.interactionFormData[
      value
    ].nbCourrier = this.interactionFormData[value].nbCourrier - 1;
  }

  @HostListener("document:keypress", ["$event"])
  keyEvent(event: KeyboardEvent): void {
    if (event.key === "Enter") {
      event.preventDefault();
      this.setInteractionForm();
    }
  }
}
