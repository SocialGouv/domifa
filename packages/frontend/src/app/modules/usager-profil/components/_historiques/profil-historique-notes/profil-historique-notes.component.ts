import { Component, Input } from "@angular/core";
import { UsagerFormModel } from "../../../../usager-shared/interfaces";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { CustomToastService, AuthService } from "../../../../shared/services";
import { UsagerNotesService } from "../../../../usager-notes/services/usager-notes.service";
import { BaseUsagerNotesComponent } from "../../../../usager-notes/components/base-usager-notes/base-usager-notes.component";
import { Store } from "@ngrx/store";
import { UsagersFilterCriteriaSortValues } from "../../../../manage-usagers/components/usager-filter";

import { Order, UsagerNote } from "@domifa/common";
import { UsagerState } from "../../../../../shared";

@Component({
  selector: "app-profil-historique-notes",
  templateUrl: "./profil-historique-notes.component.html",
  styleUrls: ["../historique-table.scss"],
})
export class ProfilHistoriqueNotesComponent extends BaseUsagerNotesComponent {
  @Input() public usager!: UsagerFormModel;

  public sortValue: UsagersFilterCriteriaSortValues = "desc";
  public currentKey: keyof UsagerNote = "createdAt";

  constructor(
    protected readonly usagerNotesService: UsagerNotesService,
    protected readonly modalService: NgbModal,
    protected readonly toastService: CustomToastService,
    protected readonly authService: AuthService,
    protected readonly store: Store<UsagerState>
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
