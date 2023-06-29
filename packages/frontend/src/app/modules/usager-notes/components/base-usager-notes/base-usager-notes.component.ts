import { Component, Input, OnDestroy, OnInit } from "@angular/core";
import { Observable, Subscription, take } from "rxjs";
import {
  UserStructure,
  UsagerNote,
  UsagerLight,
} from "../../../../../_common/model";
import {
  Order,
  PageOptions,
  PageResults,
} from "../../../../../_common/model/pagination";
import { AuthService, CustomToastService } from "../../../shared/services";
import { UsagerFormModel } from "../../../usager-shared/interfaces";
import { UsagerNotesService } from "../../services/usager-notes.service";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { Store, select } from "@ngrx/store";
import { selectUsagerByRef } from "../../../../shared";

@Component({
  selector: "app-base-usager-notes",
  templateUrl: "./base-usager-notes.component.html",
  styleUrls: ["./base-usager-notes.component.css"],
})
export class BaseUsagerNotesComponent implements OnInit, OnDestroy {
  @Input() public me!: UserStructure;
  @Input() public usager!: UsagerFormModel;

  public params!: PageOptions;

  public loading: boolean;
  public notes: UsagerNote[];
  public getArchivedNotes = false;
  private subscription = new Subscription();

  public currentUserSubject$: Observable<UserStructure | null>;

  constructor(
    public usagerNotesService: UsagerNotesService,
    public modalService: NgbModal,
    public toastService: CustomToastService,
    public authService: AuthService,
    public store: Store
  ) {
    this.loading = false;
    this.notes = [];
    this.params = {
      order: Order.DESC,
      page: 1,
      take: 5,
    };
  }

  ngOnInit(): void {
    this.getUsagerNotes();
    this.currentUserSubject$ = this.authService.currentUserSubject;
  }

  public getUsagerNotes(): void {
    this.loading = true;

    this.store
      .pipe(select(selectUsagerByRef(this.usager.ref.toString())), take(1))
      .subscribe((usager: UsagerLight) => {
        if (usager) {
          this.subscription.add(
            this.usagerNotesService
              .getNotes(usager, this.params, this.getArchivedNotes)
              .subscribe({
                next: (notes: PageResults<UsagerNote>) => {
                  this.notes = notes.data;
                  this.loading = false;
                },
                error: () => {
                  this.toastService.error("Impossible d'afficher les notes");
                  this.loading = false;
                },
              })
          );
        }
      });
  }

  public closeModals() {
    this.modalService.dismissAll();
  }

  public ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
