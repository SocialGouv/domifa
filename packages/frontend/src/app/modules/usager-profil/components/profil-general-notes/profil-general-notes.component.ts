import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
} from "@angular/core";
import { ToastrService } from "ngx-toastr";
import { AppUser, UsagerNote } from "../../../../../_common/model";
import { UsagerFormModel } from "../../../usagers/components/form/UsagerFormModel";
import { UsagerService } from "../../../usagers/services/usager.service";

@Component({
  selector: "app-profil-general-notes",
  templateUrl: "./profil-general-notes.component.html",
  styleUrls: ["./profil-general-notes.component.css"],
})
export class ProfilGeneralNotesComponent implements OnInit, OnChanges {
  @Input() public usager: UsagerFormModel;
  @Input() public me: AppUser;

  public displayConfirmArchiveMessageNoteId: string;

  public filteredNotes: UsagerNote[];

  @Output()
  public onUsagerChanges = new EventEmitter();

  constructor(
    private usagerService: UsagerService,
    private notifService: ToastrService
  ) {}

  public ngOnInit(): void {}
  public ngOnChanges(): void {
    if (this.usager?.notes) {
      this.filteredNotes = this.usager.notes.filter((x) => !x.archived);
    }
  }

  public cancelArchiveNote() {
    this.displayConfirmArchiveMessageNoteId = undefined;
  }
  public confirmArchiveNote(note: UsagerNote) {
    this.displayConfirmArchiveMessageNoteId = undefined;
    this.usagerService
      .archiveNote({
        noteId: note.id,
        usagerRef: this.usager.ref,
      })
      .subscribe({
        next: (usager) => {
          this.notifService.success("Note archivée avec succès");
          this.onUsagerChanges.emit(usager);
        },
        error: () => {
          this.notifService.error("Impossible d'archiver cette note");
        },
      });
  }
}
