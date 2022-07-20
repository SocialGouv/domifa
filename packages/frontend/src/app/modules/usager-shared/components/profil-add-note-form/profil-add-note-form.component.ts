import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  Validators,
} from "@angular/forms";
import { CustomToastService } from "src/app/modules/shared/services/custom-toast.service";

import { UsagerLight } from "../../../../../_common/model";
import { WhiteSpaceValidator } from "../../../../shared";
import { bounce } from "../../../../shared/animations";
import { UsagerNotesService } from "../../services/usager-notes.service";

@Component({
  animations: [bounce],
  selector: "app-profil-add-note-form",
  templateUrl: "./profil-add-note-form.component.html",
  styleUrls: ["./profil-add-note-form.component.css"],
})
export class ProfilAddNoteFormComponent implements OnInit {
  @Input() public usager!: UsagerLight;

  @Output()
  public cancel = new EventEmitter();

  @Output()
  public confirm = new EventEmitter();

  public addNoteForm!: FormGroup;
  public submitted: boolean;
  public loading: boolean;

  constructor(
    private readonly usagerNotesService: UsagerNotesService,
    private readonly toastService: CustomToastService,
    private readonly formBuilder: FormBuilder
  ) {
    this.loading = false;
    this.submitted = false;
  }

  public ngOnInit(): void {
    this.addNoteForm = this.formBuilder.group({
      message: [
        null,
        [
          Validators.required,
          WhiteSpaceValidator.noWhiteSpace,
          Validators.maxLength(1000),
        ],
      ],
    });
  }

  get f(): { [key: string]: AbstractControl } {
    return this.addNoteForm.controls;
  }

  public submit(): void {
    this.submitted = true;
    if (this.addNoteForm.invalid) {
      this.toastService.warning(
        "Un des champs du formulaire n'est pas rempli ou contient une erreur"
      );
      return;
    }

    this.loading = true;
    this.usagerNotesService
      .createNote({
        note: { message: this.addNoteForm.get("message").value },
        usagerRef: this.usager.ref,
      })
      .subscribe({
        next: (usager) => {
          this.toastService.success("Note enregistrée avec succès");
          setTimeout(() => {
            this.loading = false;
            this.submitted = false;
            this.confirm.emit(usager);
          }, 1000);
        },
        error: () => {
          this.loading = false;
          this.toastService.error("Impossible d'enregistrer cette note");
        },
      });
  }
}
