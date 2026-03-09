import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  Output,
  ViewChild,
} from "@angular/core";
import { Subscription } from "rxjs";
import { InteractionInForApi } from "../../../../../_common/model";
import { CustomToastService } from "../../../shared/services";
import { UsagerFormModel } from "../../../usager-shared/interfaces";
import { InteractionService } from "../../../usager-shared/services";
import { INTERACTIONS_LABELS_SINGULIER, InteractionType } from "@domifa/common";
import { DsfrModalComponent } from "@edugouvfr/ngx-dsfr";

@Component({
  selector: "app-manage-usagers-interactions",
  templateUrl: "./column-interactions.component.html",
  styleUrls: ["./column-interactions.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ColumnInteractionsComponent implements OnDestroy {
  @ViewChild("setInteractionInModal")
  public setInteractionInModal!: DsfrModalComponent;

  @ViewChild("setInteractionOutModal")
  public setInteractionOutModal!: DsfrModalComponent;

  @Output()
  public updateInteractions = new EventEmitter<void>();

  public isInteractionLoading: { [key in InteractionType]?: boolean } = {
    courrierIn: false,
    visite: false,
    appel: false,
  };

  @Input()
  public template!: "small-buttons" | "big-buttons";

  @Input()
  public usager!: UsagerFormModel;

  private readonly subscription = new Subscription();

  constructor(
    private readonly interactionService: InteractionService,
    private readonly toastService: CustomToastService
  ) {}

  public setSingleInteraction(
    usager: UsagerFormModel,
    type: InteractionType
  ): void {
    if (this.isInteractionLoading[type]) {
      this.toastService.warning("Veuillez patienter quelques instants");
      return;
    }

    this.isInteractionLoading[type] = true;

    const interaction: InteractionInForApi = {
      type,
      nbCourrier: 1,
      content: null,
    };

    this.subscription.add(
      this.interactionService
        .setInteraction(usager.ref, [interaction])
        .subscribe({
          next: () => {
            this.toastService.success(INTERACTIONS_LABELS_SINGULIER[type]);
            this.setFocusOnElement(type, this.usager.ref);
            this.isInteractionLoading[type] = false;
          },
          error: () => {
            this.toastService.error(
              "Impossible d'enregistrer cette interaction"
            );
            this.setFocusOnElement(type, usager.ref);
            this.isInteractionLoading[type] = false;
          },
        })
    );
  }

  public openInteractionInModal(): void {
    this.setInteractionInModal.open();
  }

  public openInteractionOutModal(): void {
    this.setInteractionOutModal.open();
  }

  public closeInteractionInModal(
    interactionType: InteractionType | "distribution" | "reception",
    usagerRef: number
  ): void {
    this.setInteractionInModal.close();
    this.setFocusOnElement(interactionType, usagerRef);
  }

  public closeInteractionOutModal(
    interactionType: InteractionType | "distribution" | "reception",
    usagerRef: number
  ): void {
    this.setInteractionOutModal.close();
    this.setFocusOnElement(interactionType, usagerRef);
  }

  public cancelReception(
    interactionType: InteractionType | "distribution" | "reception",
    usagerRef: number
  ): void {
    this.setFocusOnElement(interactionType, usagerRef);
  }

  private setFocusOnElement(
    interactionType: InteractionType | "distribution" | "reception",
    usagerRef: number
  ): void {
    setTimeout(() => {
      let usagerElement = document.getElementById(
        `${interactionType}-${usagerRef}`
      );

      if (usagerElement) {
        usagerElement.focus();
      } else if (interactionType === "distribution") {
        usagerElement = document.getElementById(`reception-${usagerRef}`);
        if (usagerElement) {
          usagerElement.focus();
        }
      }
    }, 0);
  }

  public ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
