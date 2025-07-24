import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  TemplateRef,
  ViewChild,
} from "@angular/core";
import {
  AbstractControl,
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from "@angular/forms";
import { Subscription } from "rxjs";

import { NoWhiteSpaceValidator, bounce } from "../../../../shared";
import { UsagerFormModel } from "../../../usager-shared/interfaces";
import { UsagerNotesService } from "../../services/usager-notes.service";
import { CustomToastService } from "../../../shared/services/custom-toast.service";
import { NgbModal, NgbModalRef } from "@ng-bootstrap/ng-bootstrap";
import { DEFAULT_MODAL_OPTIONS } from "../../../../../_common/model";

@Component({
  animations: [bounce],
  selector: "app-profil-add-note-form",
  templateUrl: "./profil-add-note-form.component.html",
})
export class ProfilAddNoteFormComponent implements OnInit, OnDestroy {
  @Input() public usager!: UsagerFormModel;

  @Output()
  public cancel = new EventEmitter();

  @Output()
  public getUsagerNotes = new EventEmitter();

  @ViewChild("addNoteInModal", { static: true })
  public addNoteInModal!: TemplateRef<NgbModalRef>;

  public addNoteForm!: UntypedFormGroup;
  public submitted: boolean;
  public loading: boolean;
  private readonly subscription = new Subscription();

  constructor(
    private readonly usagerNotesService: UsagerNotesService,
    private readonly modalService: NgbModal,
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
    this.modalService.open(this.addNoteInModal, DEFAULT_MODAL_OPTIONS);
  }

  public ngOnInit(): void {
    this.addNoteForm = this.formBuilder.group({
      message: [
        null,
        [
          Validators.required,
          NoWhiteSpaceValidator,
          Validators.maxLength(1000),
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
