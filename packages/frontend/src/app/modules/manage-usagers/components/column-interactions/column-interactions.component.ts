import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  Output,
} from "@angular/core";
import { Subscription } from "rxjs";

import { CustomToastService } from "../../../shared/services";
import { UsagerFormModel } from "../../../usager-shared/interfaces";
import { InteractionService } from "../../../usager-shared/services";
import { INTERACTIONS_LABELS_SINGULIER, InteractionType } from "@domifa/common";
import { InteractionInForApi } from "../../../usager-shared/interfaces/interaction";

@Component({
  selector: "app-manage-usagers-interactions",
  templateUrl: "./column-interactions.component.html",
  styleUrls: ["./column-interactions.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class ColumnInteractionsComponent implements OnDestroy {
  @Output()
  public updateInteractions = new EventEmitter<void>();

  @Output()
  public openReception = new EventEmitter<UsagerFormModel>();

  @Output()
  public openDistribution = new EventEmitter<UsagerFormModel>();

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
    this.openReception.emit(this.usager);
  }

  public openInteractionOutModal(): void {
    this.openDistribution.emit(this.usager);
  }

  private setFocusOnElement(type: InteractionType, usagerRef: number): void {
    setTimeout(() => {
      const element = document.getElementById(`${type}-${usagerRef}`);
      if (element) {
        element.focus();
      }
    }, 0);
  }

  public ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
