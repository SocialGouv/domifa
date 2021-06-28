import {
  Component,
  EventEmitter,
  HostListener,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from "@angular/core";
import { ToastrService } from "ngx-toastr";
import { BehaviorSubject, combineLatest, Subscription } from "rxjs";
import { UsagerLight } from "../../../../../../_common/model";
import {
  InteractionOutForm,
  INTERACTIONS_OUT_AVAILABLE,
} from "../../../../../../_common/model/interaction";
import { bounce } from "../../../../../shared/animations";
import { Interaction } from "../../../interfaces/interaction";
import { isProcurationActifMaintenant } from "../../../services";
import { InteractionService } from "../../../services/interaction.service";
import { UsagerService } from "../../../services/usager.service";
import { UsagerFormModel } from "../../form/UsagerFormModel";
@Component({
  animations: [bounce],
  selector: "app-set-interaction-out-form",
  templateUrl: "./set-interaction-out-form.component.html",
  styleUrls: ["../interactions.css"],
})
export class SetInteractionOutFormComponent implements OnInit, OnDestroy {
  @Input() public usager: UsagerFormModel;

  @Output()
  public cancelReception = new EventEmitter<void>();

  @Output()
  public usagerChange = new EventEmitter<UsagerFormModel>();

  public interactions$ = new BehaviorSubject<Interaction[]>();
  public selectedInteractionsWithContent: Interaction[] = [];

  public interactionFormData: InteractionOutForm;
  public interactionFormData$ = new BehaviorSubject<InteractionOutForm>();
  public procuration: boolean; // Mandataire = true / domicilié = false

  public displayProcuration() {
    return isProcurationActifMaintenant(this.usager);
  }

  private subscription = new Subscription();

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
    this.interactionFormData$.next(this.interactionFormData);
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
                    interactionFormData["courrierOut"]?.selected) ||
                  (interaction.type === "recommandeIn" &&
                    interactionFormData["recommandeOut"]?.selected) ||
                  (interaction.type === "colisIn" &&
                    interactionFormData["colisOut"]?.selected)
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

  public toggleSelect(type: "courrierOut" | "recommandeOut" | "colisOut") {
    this.interactionFormData[type].selected =
      !this.interactionFormData[type].selected;
    this.interactionFormData$.next(this.interactionFormData);
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

  private getInteractions() {
    this.interactionService
      .getInteractions({ usagerRef: this.usager.ref, filter: "distribution" })
      .subscribe((interactions: Interaction[]) => {
        this.interactions$.next(interactions);
      });
  }

  @HostListener("document:keypress", ["$event"])
  keyEvent(event: KeyboardEvent) {
    if (event.key === "Enter") {
      event.preventDefault();
      this.setInteractionForm();
    }
  }
}
