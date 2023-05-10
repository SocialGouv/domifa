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

import { noWhiteSpace, bounce } from "../../../../shared";
import { UsagerFormModel } from "../../../usager-shared/interfaces";
import { UsagerNotesService } from "../../services/usager-notes.service";
import { CustomToastService } from "../../../shared/services/custom-toast.service";
import { Usager } from "../../../../../_common/model";
import { NgbModal, NgbModalRef } from "@ng-bootstrap/ng-bootstrap";

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

  @Output()
  public getUsagerNotes = new EventEmitter();

  @ViewChild("addNoteInModal", { static: true })
  public addNoteInModal!: TemplateRef<NgbModalRef>;

  public addNoteForm!: UntypedFormGroup;
  public submitted: boolean;
  public loading: boolean;
  private subscription = new Subscription();

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
    this.modalService.open(this.addNoteInModal);
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
          next: (usager: Usager) => {
            this.toastService.success("Note enregistrée avec succès");
            this.loading = false;
            this.submitted = false;
            this.addNoteForm.reset();
            this.cancel.emit();
            this.getUsagerNotes.emit();
            setTimeout(() => {
              this.usagerChange.emit(new UsagerFormModel(usager));
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
