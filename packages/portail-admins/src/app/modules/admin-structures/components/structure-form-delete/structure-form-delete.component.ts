import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  Output,
  OnInit,
  ViewChild,
  AfterViewInit,
} from "@angular/core";
import {
  FormGroup,
  FormBuilder,
  Validators,
  AbstractControl,
  ValidationErrors,
  ValidatorFn,
  ReactiveFormsModule,
} from "@angular/forms";
import {
  StructureDecisionRefusMotif,
  MOTIFS_SUPPRESSION_STRUCTURE_LABELS,
} from "@domifa/common";
import { Subscription } from "rxjs";
import { AdminStructuresApiClient } from "../../../shared/services";
import { StructureAdmin } from "../../types";
import { CommonModule } from "@angular/common";
import {
  DsfrModalModule,
  DsfrButtonModule,
  DsfrButtonsGroupModule,
  DsfrModalComponent,
} from "@edugouvfr/ngx-dsfr";

@Component({
  selector: "app-structure-form-delete",
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DsfrModalModule,
    DsfrButtonModule,
    DsfrButtonsGroupModule,
  ],
  templateUrl: "./structure-form-delete.component.html",
})
export class StructureFormDeleteComponent
  implements OnInit, OnDestroy, AfterViewInit
{
  @Input() public structure!: StructureAdmin | null; // Modifié pour accepter null
  @Output() public readonly closeModals = new EventEmitter<void>();
  @Output() public readonly deleteSuccess = new EventEmitter<void>();

  public deleteForm!: FormGroup;
  public submitted = false;
  public loading = false;

  private readonly subscription = new Subscription();

  get f(): { [key: string]: AbstractControl } {
    return this.deleteForm.controls;
  }

  public readonly MOTIFS_SUPPRESSION_STRUCTURE_LABELS =
    MOTIFS_SUPPRESSION_STRUCTURE_LABELS;

  public motifs = Object.entries(MOTIFS_SUPPRESSION_STRUCTURE_LABELS).map(
    ([key, label]) => ({
      key,
      label,
    })
  );

  @ViewChild(DsfrModalComponent) deleteStructureModal!: DsfrModalComponent;

  constructor(
    private fb: FormBuilder,
    private readonly adminStructuresApiClient: AdminStructuresApiClient
  ) {}

  ngOnInit(): void {
    this.initForm();
  }

  ngAfterViewInit(): void {
    console.log(this.deleteStructureModal);
    this.openModal();
  }

  private initForm(): void {
    this.deleteForm = this.fb.group({
      motif: ["", Validators.required],
      structureName: ["", [Validators.required, this.structureNameValidator()]],
    });
  }

  public opened(): void {
    setTimeout(() => {
      const element = document.getElementById("confirmationDelete");
      if (element) {
        element.focus();
      }
    }, 100);

    this.updateStructureValidator();
  }

  public openModal(): void {
    if (!this.structure) {
      return;
    }

    this.resetForm();

    setTimeout(() => {
      this.deleteStructureModal.open();
    }, 100);
  }

  public closeModal(): void {
    this.resetForm();
    if (this.deleteStructureModal) {
      this.closeModals.emit();
    }
  }

  private resetForm(): void {
    this.deleteForm.reset({
      motif: "",
      structureName: "",
    });
    this.submitted = false;
    this.loading = false;
  }

  private updateStructureValidator(): void {
    const structureNameControl = this.deleteForm.get("structureName");
    if (structureNameControl && this.structure) {
      structureNameControl.setValidators([
        Validators.required,
        this.structureNameValidator(),
      ]);
      structureNameControl.updateValueAndValidity();
    }
  }

  private structureNameValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value || !this.structure) {
        return null;
      }
      const isValid = control.value.trim() === this.structure.nom.trim();
      return isValid ? null : { structureNameMismatch: true };
    };
  }

  public setDecision(): void {
    if (!this.structure) return;

    this.submitted = true;

    if (this.deleteForm.invalid) {
      return;
    }

    this.loading = true;
    const motif = this.deleteForm.value.motif as StructureDecisionRefusMotif;

    this.subscription.add(
      this.adminStructuresApiClient
        .setDecisionStructure(this.structure.id, "SUPPRIME", motif)
        .subscribe({
          next: () => {
            this.loading = false;
            this.deleteSuccess.emit();
            this.closeModal();
          },
          error: (error) => {
            this.loading = false;
            console.error("Erreur lors de la suppression:", error);
          },
        })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
