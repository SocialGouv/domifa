import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
} from "@angular/core";
import { Subscription } from "rxjs";
import { DsfrTooltipDirective } from "@edugouvfr/ngx-dsfr";

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
  imports: [DsfrTooltipDirective],
})
export class ColumnInteractionsComponent implements OnChanges, OnDestroy {
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

  public distributionTooltip = "";

  private readonly subscription = new Subscription();

  public ngOnChanges(changes: SimpleChanges): void {
    if (!changes["usager"]) return;
    if (!this.usager?.lastInteraction?.enAttente) {
      this.distributionTooltip = "";
      return;
    }
    const { courrierIn, recommandeIn, colisIn } = this.usager.lastInteraction;
    const lines: string[] = ["<strong>Distribuer les courriers</strong>"];
    if (courrierIn > 0) {
      lines.push(`<strong>${courrierIn}</strong> courriers`);
    }
    if (recommandeIn > 0) {
      lines.push(`<strong>${recommandeIn}</strong> avis de passage`);
    }
    if (colisIn > 0) {
      lines.push(`<strong>${colisIn}</strong> colis`);
    }
    this.distributionTooltip = lines.join("<br>");
  }

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
