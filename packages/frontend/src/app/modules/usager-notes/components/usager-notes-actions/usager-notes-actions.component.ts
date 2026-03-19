import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  Output,
  ViewChild,
  inject,
} from "@angular/core";

import { DsfrModalComponent } from "@edugouvfr/ngx-dsfr";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { UsagerNotesService } from "../../services/usager-notes.service";
import { CustomToastService } from "../../../shared/services";
import { UsagerFormModel } from "../../../usager-shared/interfaces";
import { UsagerNote } from "@domifa/common";

type ActionType = "DELETE" | "ARCHIVE";

@Component({
  selector: "app-usager-notes-actions",
  templateUrl: "./usager-notes-actions.component.html",
})
export class UsagerNotesActionsComponent implements OnDestroy {
  @Input({ required: true }) note!: UsagerNote;
  @Input({ required: true }) usager!: UsagerFormModel;
  @Output() getUsagerNotes = new EventEmitter<void>();

  @ViewChild("deleteOrArchiveNoteModal", { static: false })
  deleteOrArchiveNoteModal!: DsfrModalComponent;

  loading = false;
  choosenAction: ActionType | null = null;
  modalTitle = "";

  private readonly usagerNotesService = inject(UsagerNotesService);
  private readonly toastService = inject(CustomToastService);

  private readonly destroy$ = new Subject<void>();

  openActionModal(action: ActionType): void {
    this.choosenAction = action;
    this.modalTitle = this.getModalTitle(action);
    this.deleteOrArchiveNoteModal.open();
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
    this.deleteOrArchiveNoteModal.close();
  }

  private closeModal(): void {
    this.loading = false;
    this.choosenAction = null;
    this.deleteOrArchiveNoteModal.close();
  }

  private getModalTitle(action: ActionType): string {
    if (action === "DELETE") {
      return `Supprimer une note de ${this.usager.nom} ${this.usager.prenom}`;
    }
    return this.note.archived
      ? `Désarchiver une note de ${this.usager.nom} ${this.usager.prenom}`
      : `Archiver une note de ${this.usager.nom} ${this.usager.prenom}`;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
