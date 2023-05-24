import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from "@angular/core";
import { Observable, Subscription } from "rxjs";
import { UserStructure, UsagerNote } from "../../../../../_common/model";
import {
  Order,
  PageOptions,
  PageResults,
} from "../../../../../_common/model/pagination";
import { AuthService, CustomToastService } from "../../../shared/services";
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
  @Output() public usagerChange = new EventEmitter<UsagerFormModel>();

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
    public authService: AuthService
  ) {
    this.loading = false;
    this.notes = [];
    this.params = {
      order: Order.DESC,
      page: 1,
      take: 5,
    };

    this.currentUserSubject$ = this.authService.currentUserSubject;
  }

  ngOnInit(): void {
    if (this.usager.uuid) {
      this.getUsagerNotes();
    }
  }

  public getUsagerNotes(): void {
    this.loading = true;

    this.subscription.add(
      this.usagerNotesService
        .getNotes(this.usager.ref, this.params, this.getArchivedNotes)
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

  public updateUsager(usager: UsagerFormModel) {
    this.usagerChange.emit(usager);
  }

  public closeModals() {
    this.modalService.dismissAll();
  }

  public ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
