import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
} from "@angular/core";
import { CustomToastService } from "src/app/modules/shared/services/custom-toast.service";

import { UsagerNote, UserStructure } from "../../../../../_common/model";
import { UsagerFormModel } from "../../interfaces";
import { UsagerNotesService } from "../../services/usager-notes.service";

@Component({
  selector: "app-profil-general-notes",
  templateUrl: "./profil-general-notes.component.html",
  styleUrls: ["./profil-general-notes.component.css"],
})
export class ProfilGeneralNotesComponent implements OnInit, OnChanges {
  @Input() public usager: UsagerFormModel;
  @Input() public me: UserStructure;

  public displayConfirmArchiveMessageNoteId: string;

  public filteredNotes: UsagerNote[];

  @Output()
  public usagerChanges = new EventEmitter();

  constructor(
    private usagerNotesService: UsagerNotesService,
    private toastService: CustomToastService
  ) {
    this.me = null;
    this.usager = null;
  }

  public ngOnInit(): void {}

  public ngOnChanges(): void {
    this.sortNotes();
  }

  public sortNotes(): void {
    if (this.usager?.notes) {
      this.filteredNotes = this.usager.notes.filter((x) => !x.archived);

      this.filteredNotes.sort((a, b) => {
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      });
    }
  }
  public cancelArchiveNote(): void {
    this.displayConfirmArchiveMessageNoteId = undefined;
  }

  public confirmArchiveNote(note: UsagerNote): void {
    this.displayConfirmArchiveMessageNoteId = undefined;
    this.usagerNotesService
      .archiveNote({
        noteId: note.id,
        usagerRef: this.usager.ref,
      })
      .subscribe({
        next: (usager) => {
          this.filteredNotes = usager.notes.filter((x) => !x.archived);
          this.toastService.success("Note archivée avec succès");
          this.usager = new UsagerFormModel(usager);
          this.sortNotes();
          this.usagerChanges.emit(usager);
        },
        error: () => {
          this.toastService.error("Impossible d'archiver cette note");
        },
      });
  }
}
