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
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from "@angular/forms";
import { UsagerFormModel } from "../../../usager-shared/interfaces";
import { Subscription } from "rxjs";
import { NoWhiteSpaceValidator } from "../../../../shared";
import { CustomToastService } from "../../../shared/services";
import { UsagerNotesService } from "../../../usager-notes/services/usager-notes.service";
import { UsagerDecisionService } from "../../../usager-shared/services";

import { format } from "date-fns";
import { UserStructure } from "@domifa/common";

@Component({
  selector: "app-decision-standby-form",
  templateUrl: "./decision-standby-form.component.html",
  styleUrls: ["./decision-standby-form.component.css"],
})
export class DecisionStandbyFormComponent implements OnInit, OnDestroy {
  @Input() public usager!: UsagerFormModel;
  @Input() public me!: UserStructure;
  @Output() public closeModals = new EventEmitter<void>();

  public submitted: boolean;
  public loading: boolean;
  public addNoteForm!: UntypedFormGroup;
  private subscription = new Subscription();

  constructor(
    private readonly usagerNotesService: UsagerNotesService,
    private readonly toastService: CustomToastService,
    private readonly formBuilder: UntypedFormBuilder,
    private readonly usagerDecisionService: UsagerDecisionService
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

    const date = format(new Date(), "dd/MM/yyyy à HH:mm");
    const user = `${this.me.nom} ${this.me.prenom}`;
    const message = `Dossier ajourné le ${date} par ${user}: ${
      this.addNoteForm.get("message")?.value
    }`;

    this.loading = true;
    this.subscription.add(
      this.usagerNotesService
        .createNote({
          note: { message },
          usagerRef: this.usager.ref,
        })
        .subscribe({
          next: () => {
            this.loading = false;
            this.submitted = false;
            this.addNoteForm.reset();
            this.setDecisionAttente();
          },
          error: () => {
            this.loading = false;
            this.toastService.error("Impossible d'enregistrer cette note");
          },
        })
    );
  }

  public setDecisionAttente() {
    this.subscription.add(
      this.usagerDecisionService
        .setDecision(this.usager.ref, { statut: "INSTRUCTION" }, true)
        .subscribe({
          next: () => {
            this.closeModals.emit();
            this.toastService.success("Décision enregistrée avec succès !");
          },
          error: () => {
            this.toastService.error("La décision n'a pas pu être enregistrée");
          },
        })
    );
  }
}
