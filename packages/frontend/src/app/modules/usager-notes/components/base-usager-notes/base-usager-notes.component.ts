import { Component, Input, OnDestroy, OnInit } from "@angular/core";
import { Subscription } from "rxjs";
import { UserStructure, UsagerNote } from "../../../../../_common/model";
import {
  Order,
  PageOptions,
  PageResults,
} from "../../../../../_common/model/pagination";
import { CustomToastService } from "../../../shared/services";
import { UsagerFormModel } from "../../../usager-shared/interfaces";
import { UsagerNotesService } from "../../services/usager-notes.service";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";

@Component({
  selector: "app-base-usager-notes",
  templateUrl: "./base-usager-notes.component.html",
  styleUrls: ["./base-usager-notes.component.css"],
})
export class BaseUsagerNotesComponent implements OnInit, OnDestroy {
  @Input() public me!: UserStructure;
  @Input() public usager!: UsagerFormModel;
  @Input() public params!: PageOptions;

  public loading: boolean;
  public notes: UsagerNote[];

  private subscription = new Subscription();

  constructor(
    public usagerNotesService: UsagerNotesService,
    public modalService: NgbModal,
    public toastService: CustomToastService
  ) {
    this.loading = false;
    this.notes = [];
  }

  ngOnInit(): void {
    this.getUsagerNotes();
  }

  public getUsagerNotes(): void {
    this.loading = true;

    const params = {
      order: Order.DESC,
      page: 1,
      take: 5,
    };

    this.subscription.add(
      this.usagerNotesService
        .getNotes(this.usager.ref, params, false)
        .subscribe({
          next: (notes: PageResults<UsagerNote>) => {
            console.log(notes);
            this.notes = notes.data;
            this.loading = false;
          },
          error: () => {
            this.toastService.error("Impossible d'archiver cette note");
            this.loading = false;
          },
        })
    );
  }

  public closeModals() {
    this.modalService.dismissAll();
  }

  public reloadNotes() {
    console.log("");
  }

  public ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
