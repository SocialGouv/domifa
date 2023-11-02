import {
  Component,
  EventEmitter,
  HostListener,
  Input,
  OnDestroy,
  Output,
} from "@angular/core";
import { CustomToastService } from "src/app/modules/shared/services/custom-toast.service";
import {
  InteractionInForm,
  InteractionInForApi,
} from "../../../../../../_common/model/interaction";
import { INTERACTIONS_IN, InteractionIn } from "@domifa/common";
import { bounce } from "../../../../../shared";
import { UsagerFormModel } from "../../../interfaces";
import { InteractionService } from "../../../services/interaction.service";
import { Subscription } from "rxjs";

@Component({
  animations: [bounce],
  selector: "app-set-interaction-in-form",
  templateUrl: "./set-interaction-in-form.component.html",
  styleUrls: ["../interactions.css"],
})
export class SetInteractionInFormComponent implements OnDestroy {
  @Input() public usager!: UsagerFormModel;

  @Output()
  public cancelReception = new EventEmitter<void>();

  @Output()
  public updateInteractions = new EventEmitter<void>();

  private subscription = new Subscription();

  public interactionFormData: InteractionInForm;
  public content: string | null;
  public loading = false;

  constructor(
    private readonly interactionService: InteractionService,
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
    const interactionsToSave: InteractionInForApi[] = INTERACTIONS_IN.reduce(
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

    this.subscription.add(
      this.interactionService
        .setInteraction(this.usager.ref, interactionsToSave)
        .subscribe({
          next: () => {
            this.toastService.success("Réception enregistrée avec succès");
            this.cancelReception.emit();
            this.updateInteractions.emit();
          },
          error: () => {
            this.toastService.error(
              "Impossible d'enregistrer cette interaction"
            );
            this.loading = false;
          },
        })
    );
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
  public keyEvent(event: KeyboardEvent): void {
    if (event.key === "Enter") {
      event.preventDefault();
      this.setInteractionForm();
    }
  }

  public ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
