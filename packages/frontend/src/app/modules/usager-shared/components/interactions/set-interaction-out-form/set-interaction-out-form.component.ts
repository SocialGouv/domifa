import {
  Component,
  EventEmitter,
  HostListener,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from "@angular/core";

import { BehaviorSubject, Subscription, combineLatest } from "rxjs";
import {
  InteractionOutForm,
  InteractionOutForApi,
} from "../../../../../../_common/model";
import { bounce } from "../../../../../shared";
import { CustomToastService } from "../../../../shared/services";
import { UsagerFormModel } from "../../../interfaces";

import { InteractionService } from "../../../services/interaction.service";
import {
  INTERACTIONS_OUT,
  Interaction,
  Order,
  PageResults,
} from "@domifa/common";

@Component({
  animations: [bounce],
  selector: "app-set-interaction-out-form",
  templateUrl: "./set-interaction-out-form.component.html",
  styleUrls: ["../interactions.css"],
})
export class SetInteractionOutFormComponent implements OnInit, OnDestroy {
  @Input() public usager!: UsagerFormModel;

  @Output()
  public cancelReception = new EventEmitter<void>();

  @Output()
  public updateInteractions = new EventEmitter<void>();

  public interactions$: BehaviorSubject<Interaction[]>;
  public selectedInteractionsWithContent: Interaction[] = [];

  public interactionFormData: InteractionOutForm;
  public interactionFormData$: BehaviorSubject<InteractionOutForm>;

  public procurationIndex: number | null; // Mandataire = true / domicilié = false
  public returnToSender: boolean = false;
  public loading = false;

  private readonly subscription = new Subscription();

  constructor(
    private readonly interactionService: InteractionService,
    private readonly toastService: CustomToastService
  ) {
    this.procurationIndex = null;
    this.interactionFormData = {
      courrierOut: {
        nbCourrier: 0,
        selected: false,
        procurationIndex: 0,
      },
      recommandeOut: {
        nbCourrier: 0,
        selected: false,
        procurationIndex: 0,
      },
      colisOut: {
        nbCourrier: 0,
        selected: false,
        procurationIndex: 0,
      },
    };

    this.subscription = new Subscription();
    this.interactions$ = new BehaviorSubject<Interaction[]>([]);
    this.interactionFormData$ = new BehaviorSubject<InteractionOutForm>(
      this.interactionFormData
    );
  }

  public ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  public ngOnInit(): void {
    this.toggleProcurationIndex(null);
    this.interactionFormData.courrierOut.nbCourrier =
      this.usager.lastInteraction.courrierIn;
    this.interactionFormData.recommandeOut.nbCourrier =
      this.usager.lastInteraction.recommandeIn;
    this.interactionFormData.colisOut.nbCourrier =
      this.usager.lastInteraction.colisIn;

    this.interactionFormData.courrierOut.selected =
      this.usager.lastInteraction.courrierIn > 0;
    this.interactionFormData.recommandeOut.selected =
      this.usager.lastInteraction.recommandeIn > 0;
    this.interactionFormData.colisOut.selected =
      this.usager.lastInteraction.colisIn > 0;

    this.subscription.add(
      combineLatest([this.interactions$, this.interactionFormData$]).subscribe(
        ([interactions, interactionFormData]: [
          Interaction[],
          InteractionOutForm
        ]) => {
          // update interactions with content when form or fetched data changes
          if (interactions && interactionFormData) {
            const selectedInteractionsWithContent: Interaction[] = [];
            for (const interaction of interactions) {
              if (interaction.content) {
                if (
                  (interaction.type === "courrierIn" &&
                    interactionFormData.courrierOut?.selected) ||
                  (interaction.type === "recommandeIn" &&
                    interactionFormData.recommandeOut?.selected) ||
                  (interaction.type === "colisIn" &&
                    interactionFormData.colisOut?.selected)
                ) {
                  selectedInteractionsWithContent.push(interaction);
                }
              }
            }
            this.selectedInteractionsWithContent =
              selectedInteractionsWithContent;
          }
        }
      )
    );

    this.getInteractions();
  }

  public toggleSelect(
    type: "courrierOut" | "recommandeOut" | "colisOut"
  ): void {
    this.interactionFormData[type].selected =
      !this.interactionFormData[type].selected;
    this.interactionFormData$.next(this.interactionFormData);
  }

  public toggleReturnToSender(): void {
    this.procurationIndex = null;
    this.returnToSender = true;
  }

  public toggleProcurationIndex(value: number | null): void {
    this.procurationIndex = value;
    this.returnToSender = false;
  }

  public setInteractionForm(): void {
    const interactionsToSave: InteractionOutForApi[] = INTERACTIONS_OUT.reduce(
      (filtered: InteractionOutForApi[], interaction) => {
        if (this.interactionFormData[interaction].selected) {
          filtered.push({
            procurationIndex: this.procurationIndex,
            type: interaction,
            returnToSender: this.returnToSender ?? false,
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

    this.loading = true;
    this.subscription.add(
      this.interactionService
        .setInteraction(this.usager.ref, interactionsToSave)
        .subscribe({
          next: () => {
            this.loading = false;
            this.updateInteractions.emit();
            this.cancelReception.emit();
            this.toastService.success("Distribution effectuée avec succès");
          },
          error: () => {
            this.loading = false;
            this.toastService.error(
              "Impossible d'enregistrer cette interaction"
            );
          },
        })
    );
  }

  @HostListener("document:keypress", ["$event"])
  public keyEvent(event: KeyboardEvent): void {
    if (event.key === "Enter") {
      event.preventDefault();
      this.setInteractionForm();
    }
  }

  private getInteractions(): void {
    this.subscription.add(
      this.interactionService
        .getInteractions(this.usager.ref, {
          order: Order.DESC,
          page: 1,
          take: 5,
        })
        .subscribe((response: PageResults<Interaction>) => {
          const interactions = Array.isArray(response.data)
            ? response.data.map((item: Interaction) => new Interaction(item))
            : [new Interaction(response.data)];

          this.interactions$.next(interactions);
        })
    );
  }
}
