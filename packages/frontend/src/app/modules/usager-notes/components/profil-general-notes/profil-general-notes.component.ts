import { Component } from "@angular/core";
import { CustomToastService } from "src/app/modules/shared/services/custom-toast.service";

import { UsagerNotesService } from "../../services/usager-notes.service";
import { BaseUsagerNotesComponent } from "../base-usager-notes/base-usager-notes.component";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { AuthService } from "../../../shared/services";
import { Store } from "@ngrx/store";

@Component({
  selector: "app-profil-general-notes",
  templateUrl: "./profil-general-notes.component.html",
  styleUrls: ["./profil-general-notes.component.css"],
})
export class ProfilGeneralNotesComponent extends BaseUsagerNotesComponent {
  constructor(
    public usagerNotesService: UsagerNotesService,
    public modalService: NgbModal,
    public toastService: CustomToastService,
    public authService: AuthService,
    public store: Store
  ) {
    super(usagerNotesService, modalService, toastService, authService, store);
  }
}
