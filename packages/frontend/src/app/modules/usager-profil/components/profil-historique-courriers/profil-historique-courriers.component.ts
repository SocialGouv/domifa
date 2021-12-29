import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import {
  Component,
  Input,
  OnInit,
  TemplateRef,
  ViewChild,
} from "@angular/core";

import { ToastrService } from "ngx-toastr";
import {
  InteractionEvent,
  UsagerLight,
  UserStructure,
} from "../../../../../_common/model";
import {
  UsagerFormModel,
  Interaction,
} from "../../../usager-shared/interfaces";
import { InteractionService } from "../../../usager-shared/services/interaction.service";

@Component({
  selector: "app-profil-historique-courriers",
  templateUrl: "./profil-historique-courriers.component.html",
  styleUrls: ["./profil-historique-courriers.component.css"],
})
export class ProfilHistoriqueCourriersComponent implements OnInit {
  @Input() public usager: UsagerFormModel;
  @Input() public me: UserStructure;

  public interactions: Interaction[];
  public interactionToDelete: Interaction;

  @ViewChild("deleteInteractionModal", { static: true })
  public deleteInteractionModal!: TemplateRef<any>;
  @ViewChild("restoreInteractionModal", { static: true })
  public restoreInteractionModal!: TemplateRef<any>;

  constructor(
    private notifService: ToastrService,

    private interactionService: InteractionService,
    private modalService: NgbModal
  ) {
    this.interactionToDelete = null;
    this.interactions = [];
  }

  public ngOnInit(): void {
    this.getInteractions();
  }

  public deleteInteraction() {
    this.interactionService
      .delete(this.usager.ref, this.interactionToDelete.uuid)
      .subscribe({
        next: (usager: UsagerLight) => {
          this.usager = new UsagerFormModel(usager);
          this.notifService.success("Interaction supprimée avec succès");
          this.interactionToDelete = null;
          this.getInteractions();
          this.closeModals();
        },
        error: () => {
          this.notifService.error("Impossible de supprimer l'interaction");
        },
      });
  }

  private getInteractions() {
    this.interactionService
      .getInteractions({
        usagerRef: this.usager.ref,
      })
      .subscribe((interactions: Interaction[]) => {
        this.interactions = interactions;
      });
  }

  public openDeleteInteractionModal(restoreOrDelete: InteractionEvent): void {
    this.modalService.open(
      restoreOrDelete === "delete"
        ? this.deleteInteractionModal
        : this.restoreInteractionModal
    );
  }

  public closeModals(): void {
    this.interactionToDelete = null;
    this.modalService.dismissAll();
  }
}
