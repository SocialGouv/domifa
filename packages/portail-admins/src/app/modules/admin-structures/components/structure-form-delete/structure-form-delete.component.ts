import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  Output,
} from "@angular/core";
import {
  FormGroup,
  FormBuilder,
  Validators,
  AbstractControl,
  ValidationErrors,
  ValidatorFn,
} from "@angular/forms";
import {
  StructureDecisionRefusMotif,
  MOTIFS_SUPPRESSION_STRUCTURE_LABELS,
} from "@domifa/common";
import { Subscription } from "rxjs";
import { AdminStructuresApiClient } from "../../../shared/services";
import { StructureAdmin } from "../../types";

@Component({
  selector: "app-structure-form-delete",
  templateUrl: "./structure-form-delete.component.html",
})
export class StructureFormDeleteComponent implements OnDestroy {
  @Input({ required: true }) public structure: StructureAdmin;
  @Output() public readonly closeModals = new EventEmitter<void>();

  public deleteForm: FormGroup;
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

  constructor(
    private fb: FormBuilder,
    private readonly adminStructuresApiClient: AdminStructuresApiClient
  ) {
    this.initForm();
  }

  initForm(): void {
    this.deleteForm = this.fb.group({
      motif: ["", Validators.required],
      structureName: ["", [Validators.required, this.structureNameValidator()]],
    });
  }

  structureNameValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }

      const isValid = control.value === this.structure?.nom;
      return isValid ? null : { structureNameMismatch: true };
    };
  }
  get r() {
    return this.deleteForm.controls;
  }

  setDecision(): void {
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
          },
          error: () => {
            this.loading = false;
          },
        })
    );
  }

  close(): void {
    this.closeModals.emit();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
