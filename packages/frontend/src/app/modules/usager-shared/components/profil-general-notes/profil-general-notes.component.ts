import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  Output,
} from "@angular/core";
import { CustomToastService } from "src/app/modules/shared/services/custom-toast.service";

import {
  Usager,
  UsagerNote,
  UserStructure,
} from "../../../../../_common/model";
import { UsagerFormModel } from "../../interfaces";
import { UsagerNotesService } from "../../services/usager-notes.service";
import { Subscription } from "rxjs";

@Component({
  selector: "app-profil-general-notes",
  templateUrl: "./profil-general-notes.component.html",
  styleUrls: ["./profil-general-notes.component.css"],
})
export class ProfilGeneralNotesComponent implements OnChanges, OnDestroy {
  @Input() public usager!: UsagerFormModel;
  @Output() public usagerChange = new EventEmitter<UsagerFormModel>();
  @Input() public me!: UserStructure;

  public loading: boolean;
  public displayConfirmArchiveMessageNoteId: string | null;
  public filteredNotes: UsagerNote[];
  private subscription = new Subscription();

  constructor(
    private readonly usagerNotesService: UsagerNotesService,
    private readonly toastService: CustomToastService
  ) {
    this.displayConfirmArchiveMessageNoteId = null;
    this.loading = false;
    this.filteredNotes = [];
  }

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
    this.displayConfirmArchiveMessageNoteId = null;
  }

  public confirmArchiveNote(note: UsagerNote): void {
    this.displayConfirmArchiveMessageNoteId = null;
    this.loading = true;

    this.subscription.add(
      this.usagerNotesService
        .archiveNote({
          noteUUID: note.uuid,
          usagerRef: this.usager.ref,
        })
        .subscribe({
          next: (usager: Usager) => {
            this.filteredNotes = usager.notes.filter(
              (x: UsagerNote) => !x.archived
            );

            this.toastService.success("Note archivée avec succès");
            this.usager = new UsagerFormModel(usager);
            this.sortNotes();
            this.usagerChange.emit(this.usager);
            this.loading = false;
          },
          error: () => {
            this.toastService.error("Impossible d'archiver cette note");
            this.loading = false;
          },
        })
    );
  }

  public ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
