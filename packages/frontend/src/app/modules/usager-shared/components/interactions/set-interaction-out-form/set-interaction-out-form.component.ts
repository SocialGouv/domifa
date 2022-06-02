import {
  Component,
  EventEmitter,
  HostListener,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from "@angular/core";
import { CustomToastService } from "src/app/modules/shared/services/custom-toast.service";
import { BehaviorSubject, Subscription, combineLatest } from "rxjs";
import { UsagerLight } from "../../../../../../_common/model";
import {
  InteractionOutForApi,
  InteractionOutForm,
} from "../../../../../../_common/model/interaction";
import { INTERACTIONS_OUT_AVAILABLE } from "../../../../../../_common/model/interaction/constants";
import { bounce } from "../../../../../shared";
import { UsagerService } from "../../../../usagers/services/usager.service";
import { UsagerFormModel, Interaction } from "../../../interfaces";
import { InteractionService } from "../../../services/interaction.service";

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

  @Output()
  public usagerChange = new EventEmitter<UsagerFormModel>();

  public interactions$: BehaviorSubject<Interaction[]>;
  public selectedInteractionsWithContent: Interaction[] = [];

  public interactionFormData: InteractionOutForm;

  public interactionFormData$: BehaviorSubject<InteractionOutForm>;

  public procurationIndex: number | null; // Mandataire = true / domicilié = false
  public loading = false;

  private subscription: Subscription;

  constructor(
    private interactionService: InteractionService,
    private usagerService: UsagerService,
    private toastService: CustomToastService
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

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  public ngOnInit(): void {
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

  public setInteractionForm(): void {
    const interactionsToSave: InteractionOutForApi[] =
      INTERACTIONS_OUT_AVAILABLE.reduce(
        (filtered: InteractionOutForApi[], interaction) => {
          if (this.interactionFormData[interaction].selected) {
            filtered.push({
              procurationIndex: this.procurationIndex,

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

    this.loading = true;
    this.interactionService
      .setInteractionOut(this.usager.ref, interactionsToSave)
      .subscribe({
        next: () => {
          this.loading = false;
          this.updateInteractions.emit();
          this.toastService.success("Distribution effectuée avec succès");
          this.refreshUsager();
        },
        error: () => {
          this.loading = false;
          this.toastService.error("Impossible d'enregistrer cette interaction");
        },
      });
  }

  // Actualiser les données de l'usager
  public refreshUsager(): void {
    this.usagerService
      .findOne(this.usager.ref)
      .subscribe((usager: UsagerLight) => {
        this.usagerChange.emit(new UsagerFormModel(usager));
        this.cancelReception.emit();
      });
  }

  @HostListener("document:keypress", ["$event"])
  keyEvent(event: KeyboardEvent): void {
    if (event.key === "Enter") {
      event.preventDefault();
      this.setInteractionForm();
    }
  }

  private getInteractions() {
    // TODO: optimiser cette requête pour éviter un chargement trop important
    this.interactionService
      .getInteractions({
        usagerRef: this.usager.ref,
        filter: "distribution",
        maxResults: 10,
      })
      .subscribe((interactions: Interaction[]) => {
        this.interactions$.next(interactions);
      });
  }
}
