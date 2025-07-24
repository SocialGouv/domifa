import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  Output,
  TemplateRef,
  ViewChild,
} from "@angular/core";
import { NgbModal, NgbModalRef } from "@ng-bootstrap/ng-bootstrap";
import { DEFAULT_MODAL_OPTIONS } from "../../../../../_common/model";
import { CustomToastService } from "../../../shared/services";
import { UsagerFormModel } from "../../../usager-shared/interfaces";
import { UsagerNotesService } from "../../services/usager-notes.service";
import { Subscription } from "rxjs";
import { UsagerNote } from "@domifa/common";

@Component({
  selector: "app-usager-notes-actions",
  templateUrl: "./usager-notes-actions.component.html",
})
export class UsagerNotesActionsComponent implements OnDestroy {
  @Input() public note!: UsagerNote;
  @Input() public usager!: UsagerFormModel;

  @Output()
  public getUsagerNotes = new EventEmitter();
  private readonly subscription = new Subscription();

  public loading: boolean;
  public choosenAction: "DELETE" | "ARCHIVE" | null;

  @ViewChild("deleteOrArchiveNoteModal", { static: true })
  public deleteOrArchiveNoteModal!: TemplateRef<NgbModalRef>;

  constructor(
    private readonly usagerNotesService: UsagerNotesService,
    private readonly modalService: NgbModal,
    private readonly toastService: CustomToastService
  ) {
    this.choosenAction = null;
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

  public confirmAction(): void {
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
            this.closeModal();
            this.toastService.success("Note supprimée avec succès");
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

    const message = this.note.archived
      ? "Note désarchivée avec succès"
      : "Note archivée avec succès";

    this.subscription.add(
      this.usagerNotesService
        .archiveNote({
          noteUUID: this.note.uuid,
          usagerRef: this.usager.ref,
        })
        .subscribe({
          next: () => {
            this.closeModal();
            this.toastService.success(message);
          },
          error: () => {
            this.toastService.error("Une erreur est survenue");
            this.loading = false;
          },
        })
    );
  }

  public pinNote(note: UsagerNote): void {
    this.loading = true;
    const message = this.note.pinned
      ? "Note désépinglée avec succès"
      : "Note épinglée avec succès";

    this.subscription.add(
      this.usagerNotesService
        .pinNote({
          noteUUID: note.uuid,
          usagerRef: this.usager.ref,
        })
        .subscribe({
          next: () => {
            this.toastService.success(message);
            this.closeModal();
          },
          error: () => {
            this.toastService.error("Une erreur est survenue");
            this.loading = false;
          },
        })
    );
  }

  private closeModal(): void {
    this.loading = false;
    this.getUsagerNotes.emit();
    this.modalService.dismissAll();
  }

  public ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
