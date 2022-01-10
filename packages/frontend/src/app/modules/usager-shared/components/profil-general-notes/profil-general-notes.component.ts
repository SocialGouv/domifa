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
import { UsagerService } from "../../../usagers/services/usager.service";
import { UsagerFormModel } from "../../interfaces";

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
    private usagerService: UsagerService,
    private toastService: CustomToastService
  ) {
    this.me = null;
    this.usager = null;
  }

  public ngOnInit(): void {}

  public ngOnChanges(): void {
    if (this.usager?.notes) {
      this.filteredNotes = this.usager.notes.filter((x) => !x.archived);
    }
  }

  public cancelArchiveNote(): void {
    this.displayConfirmArchiveMessageNoteId = undefined;
  }

  public confirmArchiveNote(note: UsagerNote): void {
    this.displayConfirmArchiveMessageNoteId = undefined;
    this.usagerService
      .archiveNote({
        noteId: note.id,
        usagerRef: this.usager.ref,
      })
      .subscribe({
        next: (usager) => {
          this.toastService.success("Note archivée avec succès");
          this.usagerChanges.emit(usager);
        },
        error: () => {
          this.toastService.error("Impossible d'archiver cette note");
        },
      });
  }
}
