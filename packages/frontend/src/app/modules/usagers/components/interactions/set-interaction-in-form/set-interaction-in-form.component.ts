import {
  Component,
  EventEmitter,
  HostListener,
  Input,
  OnInit,
  Output,
} from "@angular/core";
import { ToastrService } from "ngx-toastr";
import {
  InteractionIn,
  InteractionInForm,
  INTERACTIONS_IN_AVAILABLE,
} from "../../../../../../_common/model/interaction";
import { UsagerLight } from "../../../../../../_common/model/usager/UsagerLight.type";
import { bounce } from "../../../../../shared/animations";
import { InteractionService } from "../../../services/interaction.service";
import { UsagerService } from "../../../services/usager.service";
import { UsagerFormModel } from "../../form/UsagerFormModel";

@Component({
  animations: [bounce],
  selector: "app-set-interaction-in-form",
  templateUrl: "./set-interaction-in-form.component.html",
  styleUrls: ["./set-interaction-in-form.component.css", "../interactions.css"],
})
export class SetInteractionInFormComponent implements OnInit {
  @Input() public usager: UsagerFormModel;

  @Output()
  public cancelReception = new EventEmitter<void>();

  @Output()
  public usagerChange = new EventEmitter<UsagerFormModel>();

  public interactionFormData: InteractionInForm;

  constructor(
    private interactionService: InteractionService,
    private usagerService: UsagerService,
    private notifService: ToastrService
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
  }

  public ngOnInit(): void {}

  // Ajout de courrier / colis / recommandé entrant
  public setInteractionIn(usager: UsagerFormModel) {
    this.interactionService
      .setInteractionIN(usager, this.interactionFormData)
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
    const interactionsToSave = INTERACTIONS_IN_AVAILABLE.reduce(
      (filtered, interaction) => {
        if (this.interactionFormData[interaction].nbCourrier > 0) {
          filtered.push({
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
        () => {
          this.notifService.success("Réception enregistrée avec succès");
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

  @HostListener("document:keypress", ["$event"])
  keyEvent(event: KeyboardEvent) {
    if (event.key === "Enter") {
      event.preventDefault();
      this.setInteractionForm();
    }
  }
}
