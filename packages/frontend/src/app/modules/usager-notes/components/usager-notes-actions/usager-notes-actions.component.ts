import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  Output,
  TemplateRef,
  ViewChild,
  inject,
} from "@angular/core";

import { NgbModal, NgbModalRef } from "@ng-bootstrap/ng-bootstrap";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { UsagerNotesService } from "../../services/usager-notes.service";
import { CustomToastService } from "../../../shared/services";
import { UsagerFormModel } from "../../../usager-shared/interfaces";
import { UsagerNote } from "@domifa/common";
import { DEFAULT_MODAL_OPTIONS } from "../../../../../_common/model";

type ActionType = "DELETE" | "ARCHIVE";

@Component({
  selector: "app-usager-notes-actions",
  templateUrl: "./usager-notes-actions.component.html",
})
export class UsagerNotesActionsComponent implements OnDestroy {
  @Input({ required: true }) note!: UsagerNote;
  @Input({ required: true }) usager!: UsagerFormModel;
  @Output() getUsagerNotes = new EventEmitter<void>();

  @ViewChild("deleteOrArchiveNoteModal", { static: true })
  deleteOrArchiveNoteModal!: TemplateRef<NgbModalRef>;

  // Signals et propriétés
  dropdownOpen = false;
  loading = false;
  choosenAction: ActionType | null = null;

  // Dépendances injectées
  private readonly usagerNotesService = inject(UsagerNotesService);
  private readonly modalService = inject(NgbModal);
  private readonly toastService = inject(CustomToastService);

  // Gestion du lifecycle
  private readonly destroy$ = new Subject<void>();
  private modalRef: NgbModalRef | null = null;

  toggleDropdown(): void {
    this.dropdownOpen = !this.dropdownOpen;
  }

  openActionModal(action: ActionType): void {
    this.choosenAction = action;
    this.modalRef = this.modalService.open(
      this.deleteOrArchiveNoteModal,
      DEFAULT_MODAL_OPTIONS
    );
  }

  buttonSelect(event) {
    console.log(event);
  }
  linkSelect(event) {
    console.log(event);
  }

  confirmAction(): void {
    switch (this.choosenAction) {
      case "DELETE":
        this.confirmDeleteNote();
        break;
      case "ARCHIVE":
        this.confirmArchiveNote();
        break;
    }
  }

  pinNote(note: UsagerNote): void {
    this.loading = true;
    const message = note.pinned
      ? "Note désépinglée avec succès"
      : "Note épinglée avec succès";

    this.usagerNotesService
      .pinNote({
        noteUUID: note.uuid,
        usagerRef: this.usager.ref,
      })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.toastService.success(message);
          this.closeModal();
          this.getUsagerNotes.emit();
        },
        error: () => {
          this.toastService.error("Une erreur est survenue");
          this.loading = false;
        },
      });
  }

  private confirmDeleteNote(): void {
    this.loading = true;

    this.usagerNotesService
      .deleteNote({
        noteUUID: this.note.uuid,
        usagerRef: this.usager.ref,
      })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.toastService.success("Note supprimée avec succès");
          this.closeModal();
          this.getUsagerNotes.emit();
        },
        error: () => {
          this.toastService.error("Impossible de supprimer la note");
          this.loading = false;
        },
      });
  }

  private confirmArchiveNote(): void {
    this.loading = true;
    const message = this.note.archived
      ? "Note désarchivée avec succès"
      : "Note archivée avec succès";

    this.usagerNotesService
      .archiveNote({
        noteUUID: this.note.uuid,
        usagerRef: this.usager.ref,
      })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.toastService.success(message);
          this.closeModal();
          this.getUsagerNotes.emit();
        },
        error: () => {
          this.toastService.error("Une erreur est survenue");
          this.loading = false;
        },
      });
  }

  cancelArchiveOrDelete(): void {
    this.choosenAction = null;
    this.modalRef?.dismiss();
  }

  private closeModal(): void {
    this.loading = false;
    this.choosenAction = null;
    this.modalRef?.close();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
