import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnDestroy,
  TemplateRef,
  ViewChild,
} from "@angular/core";
import { NgbModalRef, NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { Subscription } from "rxjs";
import {
  InteractionInForApi,
  DEFAULT_MODAL_OPTIONS,
} from "../../../../../_common/model";
import { CustomToastService } from "../../../shared/services";
import { UsagerFormModel } from "../../../usager-shared/interfaces";
import { InteractionService } from "../../../usager-shared/services";
import { INTERACTIONS_LABELS_SINGULIER, InteractionType } from "@domifa/common";

@Component({
  selector: "app-manage-usagers-interactions",
  templateUrl: "./column-interactions.component.html",
  styleUrls: ["./column-interactions.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ColumnInteractionsComponent implements OnDestroy {
  @ViewChild("setInteractionInModal")
  public setInteractionInModal!: TemplateRef<NgbModalRef>;

  @ViewChild("setInteractionOutModal")
  public setInteractionOutModal!: TemplateRef<NgbModalRef>;

  private lastModalRef: NgbModalRef | null = null;

  public isInteractionLoading: { [key in InteractionType]?: boolean } = {
    courrierIn: false,
    visite: false,
    appel: false,
  };

  @Input()
  public template!: "small-buttons" | "big-buttons";

  @Input()
  public usager!: UsagerFormModel;

  private subscription = new Subscription();

  constructor(
    private readonly interactionService: InteractionService,
    private readonly toastService: CustomToastService,
    private readonly modalService: NgbModal
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

  public openInteractionInModal() {
    this.lastModalRef = this.modalService.open(
      this.setInteractionInModal,
      DEFAULT_MODAL_OPTIONS
    );
  }

  public openInteractionOutModal() {
    this.lastModalRef = this.modalService.open(
      this.setInteractionOutModal,
      DEFAULT_MODAL_OPTIONS
    );
  }

  public cancelReception(
    interactionType: InteractionType | "distribution" | "reception",
    usagerRef: number
  ) {
    this.modalService.dismissAll();
    this.lastModalRef.result.then(
      () => {
        this.setFocusOnElement(interactionType, usagerRef);
      },
      () => {
        this.setFocusOnElement(interactionType, usagerRef);
      }
    );
  }

  private setFocusOnElement(
    interactionType: InteractionType | "distribution" | "reception",
    usagerRef: number
  ) {
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
