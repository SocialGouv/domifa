import {
  Component,
  EventEmitter,
  Input,
  Output,
  TemplateRef,
  ViewChild,
} from "@angular/core";
import { NgbModal, NgbModalRef } from "@ng-bootstrap/ng-bootstrap";
import {
  DEFAULT_MODAL_OPTIONS,
  UsagerNote,
} from "../../../../../_common/model";
import { CustomToastService } from "../../../shared/services";
import { UsagerFormModel } from "../../../usager-shared/interfaces";
import { UsagerNotesService } from "../../services/usager-notes.service";
import { Subscription } from "rxjs";

@Component({
  selector: "app-usager-notes-actions",
  templateUrl: "./usager-notes-actions.component.html",
  styleUrls: ["./usager-notes-actions.component.css"],
})
export class UsagerNotesActionsComponent {
  @Input() public note: UsagerNote;
  @Input() public usager: UsagerFormModel;
  @Output() public usagerChange = new EventEmitter<UsagerFormModel>();

  @Output()
  public getUsagerNotes = new EventEmitter();
  private subscription = new Subscription();

  public loading: boolean;
  public choosenAction: "DELETE" | "ARCHIVE" | null;

  @ViewChild("deleteOrArchiveNoteModal", { static: true })
  public deleteOrArchiveNoteModal!: TemplateRef<NgbModalRef>;

  constructor(
    public usagerNotesService: UsagerNotesService,
    public modalService: NgbModal,
    public toastService: CustomToastService
  ) {
    this.loading = false;
  }

  public cancelArchiveOrDelete(): void {
    this.choosenAction = null;
    this.modalService.dismissAll();
  }

  public openActionModal(choosenAction: "DELETE" | "ARCHIVE" | null): void {
    this.choosenAction = choosenAction;
    this.modalService.open(
      this.deleteOrArchiveNoteModal,
      DEFAULT_MODAL_OPTIONS
    );
  }

  public confirmAction() {
    this.choosenAction === "DELETE"
      ? this.confirmDeleteNote()
      : this.confirmArchiveNote();
  }

  public confirmDeleteNote(): void {
    this.choosenAction = null;
    this.loading = true;

    this.subscription.add(
      this.usagerNotesService
        .deleteNote({
          noteUUID: this.note.uuid,
          usagerRef: this.usager.ref,
        })
        .subscribe({
          next: () => {
            this.toastService.success("Note supprimée avec succès");
            this.closeModal();
          },
          error: () => {
            this.toastService.error("Impossible de supprimer la note");
            this.loading = false;
          },
        })
    );
  }

  public confirmArchiveNote(): void {
    this.loading = true;

    this.subscription.add(
      this.usagerNotesService
        .archiveNote({
          noteUUID: this.note.uuid,
          usagerRef: this.usager.ref,
        })
        .subscribe({
          next: () => {
            this.closeModal();
            this.toastService.success("Note archivée avec succès");
          },
          error: () => {
            this.toastService.error("Impossible d'archiver la note");
            this.loading = false;
          },
        })
    );
  }

  public pinNote(note: UsagerNote): void {
    this.loading = true;

    this.subscription.add(
      this.usagerNotesService
        .pinNote({
          noteUUID: note.uuid,
          usagerRef: this.usager.ref,
        })
        .subscribe({
          next: () => {
            this.toastService.success("Note épinglée avec succès");
            this.closeModal();
          },
          error: () => {
            this.toastService.error("Impossible d'épingler la note");
            this.loading = false;
          },
        })
    );
  }

  private closeModal() {
    this.loading = false;
    this.getUsagerNotes.emit();
    this.modalService.dismissAll();
  }
}
