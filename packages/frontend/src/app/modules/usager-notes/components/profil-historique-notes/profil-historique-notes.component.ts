import { Component, Input } from "@angular/core";
import { UsagerFormModel } from "../../../usager-shared/interfaces";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { CustomToastService, AuthService } from "../../../shared/services";
import { UsagerNotesService } from "../../services/usager-notes.service";
import { BaseUsagerNotesComponent } from "../base-usager-notes/base-usager-notes.component";
import { Order } from "../../../../../_common/model/pagination";
import { Store } from "@ngrx/store";

@Component({
  selector: "app-profil-historique-notes",
  templateUrl: "./profil-historique-notes.component.html",
})
export class ProfilHistoriqueNotesComponent extends BaseUsagerNotesComponent {
  @Input() public usager!: UsagerFormModel;

  constructor(
    public usagerNotesService: UsagerNotesService,
    public modalService: NgbModal,
    public toastService: CustomToastService,
    public authService: AuthService,
    public store: Store
  ) {
    super(usagerNotesService, modalService, toastService, authService, store);
    this.params = {
      order: Order.DESC,
      page: 1,
      take: 50,
    };
    this.getArchivedNotes = true;
  }
}
