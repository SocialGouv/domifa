import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from "@angular/core";
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  Validators,
} from "@angular/forms";
import { Subscription } from "rxjs";
import { CustomToastService } from "src/app/modules/shared/services/custom-toast.service";

import { UsagerLight } from "../../../../../_common/model";
import { noWhiteSpace } from "../../../../shared";
import { bounce } from "../../../../shared/animations";
import { UsagerFormModel } from "../../interfaces";
import { UsagerNotesService } from "../../services/usager-notes.service";

@Component({
  animations: [bounce],
  selector: "app-profil-add-note-form",
  templateUrl: "./profil-add-note-form.component.html",
  styleUrls: ["./profil-add-note-form.component.css"],
})
export class ProfilAddNoteFormComponent implements OnInit, OnDestroy {
  @Input() public usager!: UsagerFormModel;

  @Output()
  public usagerChange = new EventEmitter<UsagerFormModel>();

  @Output()
  public cancel = new EventEmitter();

  public addNoteForm!: FormGroup;
  public submitted: boolean;
  public loading: boolean;
  private subscription = new Subscription();

  constructor(
    private readonly usagerNotesService: UsagerNotesService,
    private readonly toastService: CustomToastService,
    private readonly formBuilder: FormBuilder
  ) {
    this.loading = false;
    this.submitted = false;
  }

  public ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  public ngOnInit(): void {
    this.addNoteForm = this.formBuilder.group({
      message: [
        null,
        [Validators.required, noWhiteSpace, Validators.maxLength(1000)],
      ],
    });
  }

  public get f(): { [key: string]: AbstractControl } {
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
    this.subscription.add(
      this.usagerNotesService
        .createNote({
          note: { message: this.addNoteForm.get("message")?.value },
          usagerRef: this.usager.ref,
        })
        .subscribe({
          next: (usager: UsagerLight) => {
            this.toastService.success("Note enregistrée avec succès");
            setTimeout(() => {
              this.usagerChange.emit(new UsagerFormModel(usager));
              this.loading = false;
              this.submitted = false;
              this.cancel.emit();
            }, 500);
          },
          error: () => {
            this.loading = false;
            this.toastService.error("Impossible d'enregistrer cette note");
          },
        })
    );
  }
}
