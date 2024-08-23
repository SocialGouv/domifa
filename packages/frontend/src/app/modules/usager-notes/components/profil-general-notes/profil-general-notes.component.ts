import { Component } from "@angular/core";
import { CustomToastService } from "src/app/modules/shared/services/custom-toast.service";

import { UsagerNotesService } from "../../services/usager-notes.service";
import { BaseUsagerNotesComponent } from "../base-usager-notes/base-usager-notes.component";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { AuthService } from "../../../shared/services";
import { Store } from "@ngrx/store";
import { UsagerState } from "../../../../shared";

@Component({
  selector: "app-profil-general-notes",
  templateUrl: "./profil-general-notes.component.html",
  styleUrls: ["./profil-general-notes.component.css"],
})
export class ProfilGeneralNotesComponent extends BaseUsagerNotesComponent {
  constructor(
    protected readonly usagerNotesService: UsagerNotesService,
    protected readonly modalService: NgbModal,
    protected readonly toastService: CustomToastService,
    protected readonly authService: AuthService,
    protected readonly store: Store<UsagerState>
  ) {
    super(usagerNotesService, modalService, toastService, authService, store);
  }
}
