import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
} from "@angular/core";
import {
  AbstractControl,
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from "@angular/forms";
import { Subscription } from "rxjs";
import { DsfrModalComponent } from "@edugouvfr/ngx-dsfr";

import { NoWhiteSpaceValidator, bounce } from "../../../../shared";
import { UsagerFormModel } from "../../../usager-shared/interfaces";
import { UsagerNotesService } from "../../services/usager-notes.service";
import { CustomToastService } from "../../../shared/services/custom-toast.service";

@Component({
  animations: [bounce],
  selector: "app-profil-add-note-form",
  templateUrl: "./profil-add-note-form.component.html",
})
export class ProfilAddNoteFormComponent implements OnInit, OnDestroy {
  @Input({ required: true }) public usager!: UsagerFormModel;

  @Output()
  public readonly cancel = new EventEmitter();

  @Output()
  public getUsagerNotes = new EventEmitter();

  @ViewChild("modal", { static: false })
  public modal!: DsfrModalComponent;

  public addNoteForm!: UntypedFormGroup;
  public submitted: boolean;
  public loading: boolean;
  private readonly subscription = new Subscription();

  constructor(
    private readonly usagerNotesService: UsagerNotesService,
    private readonly toastService: CustomToastService,
    private readonly formBuilder: UntypedFormBuilder
  ) {
    this.loading = false;
    this.submitted = false;
  }

  public ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  public openAddNoteInModal(): void {
    this.submitted = false;
    this.addNoteForm.reset();
    this.modal.open();
  }

  public ngOnInit(): void {
    this.addNoteForm = this.formBuilder.group({
      message: [
        null,
        [
          Validators.required,
          NoWhiteSpaceValidator,
          Validators.maxLength(1000),
          Validators.minLength(1),
        ],
      ],
    });
  }

  public get f(): { [key: string]: AbstractControl } {
    return this.addNoteForm.controls;
  }

  public submit(): void {
    this.submitted = true;
    if (this.addNoteForm.invalid) {
      this.toastService.error(
        "Un des champs du formulaire n'est pas rempli ou contient une erreur"
      );
      return;
    }

    this.loading = true;
    this.subscription.add(
      this.usagerNotesService
        .createNote({
          note: { message: this.addNoteForm.get("message")?.value },
          usagerRef: this.usager.ref,
        })
        .subscribe({
          next: () => {
            this.toastService.success("Note enregistrée avec succès");
            this.loading = false;
            this.submitted = false;
            this.addNoteForm.reset();
            this.modal.close();
            this.cancel.emit();
            this.getUsagerNotes.emit();
          },
          error: () => {
            this.loading = false;
            this.toastService.error("Impossible d'enregistrer cette note");
          },
        })
    );
  }
}
