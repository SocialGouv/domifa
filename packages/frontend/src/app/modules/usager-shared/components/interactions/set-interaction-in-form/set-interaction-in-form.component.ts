import {
  Component,
  EventEmitter,
  HostListener,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
} from "@angular/core";
import { CustomToastService } from "src/app/modules/shared/services/custom-toast.service";
import {
  InteractionInForm,
  InteractionInForApi,
} from "../../../interfaces/interaction";
import { INTERACTIONS_IN, InteractionIn } from "@domifa/common";
import { bounce, selectUsagerById, UsagerState } from "../../../../../shared";
import { UsagerFormModel } from "../../../interfaces";
import { InteractionService } from "../../../services/interaction.service";
import { Subscription } from "rxjs";
import { DsfrModalComponent } from "@edugouvfr/ngx-dsfr";
import { Store } from "@ngrx/store";
import { UsagerLight } from "../../../../../../_common/model";

@Component({
  animations: [bounce],
  selector: "app-set-interaction-in-form",
  templateUrl: "./set-interaction-in-form.component.html",
  styleUrls: ["../interactions.scss"],
  standalone: false,
})
export class SetInteractionInFormComponent implements OnInit, OnDestroy {
  @ViewChild("receptionModal")
  public receptionModal!: DsfrModalComponent;

  @Input({ required: true }) public usager!: UsagerFormModel;

  @Output()
  public readonly cancelReception = new EventEmitter<void>();

  @Output()
  public readonly updateInteractions = new EventEmitter<void>();

  private readonly subscription = new Subscription();

  public interactionFormData: InteractionInForm;
  public content: string | null;
  public loading = false;

  constructor(
    private readonly interactionService: InteractionService,
    private readonly toastService: CustomToastService,
    private readonly store: Store<UsagerState>
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

  public ngOnInit(): void {
    this.subscription.add(
      this.store.select(selectUsagerById(this.usager.ref)).subscribe({
        next: (usager: UsagerLight) => {
          if (usager) {
            this.usager = new UsagerFormModel(usager);
          }
        },
      })
    );
  }

  public open(): void {
    this.receptionModal.open();
  }

  public close(): void {
    this.receptionModal.close();
    this.cancelReception.emit();
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
            this.updateInteractions.emit();
            this.close();
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
