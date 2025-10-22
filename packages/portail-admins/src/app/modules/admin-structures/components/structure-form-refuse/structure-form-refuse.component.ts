import {
  Component,
  EventEmitter,
  Input,
  Output,
  OnDestroy,
} from "@angular/core";
import {
  FormGroup,
  FormBuilder,
  Validators,
  AbstractControl,
} from "@angular/forms";
import {
  MOTIFS_REFUS_STRUCTURE_LABELS,
  StructureDecision,
  StructureDecisionRefusMotif,
} from "@domifa/common";
import { Subscription } from "rxjs";
import { AdminStructuresApiClient } from "../../../shared/services";
import { StructureAdmin } from "../../types";

@Component({
  selector: "app-structure-form-refuse",
  templateUrl: "./structure-form-refuse.component.html",
})
export class StructureFormRefuseComponent implements OnDestroy {
  @Input({ required: true }) public structure: StructureAdmin;
  @Output() closeModals = new EventEmitter<void>();
  @Output() confirmRefus = new EventEmitter<StructureDecision>();

  public refuseForm: FormGroup;
  public submitted = false;
  public loading = false;

  get f(): { [key: string]: AbstractControl } {
    return this.refuseForm.controls;
  }
  private readonly subscription = new Subscription();

  public readonly MOTIFS_REFUS_STRUCTURE_LABELS = MOTIFS_REFUS_STRUCTURE_LABELS;
  public motifsRefus = Object.entries(MOTIFS_REFUS_STRUCTURE_LABELS).map(
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
    this.refuseForm = this.fb.group({
      motif: ["", Validators.required],
    });
  }

  get r() {
    return this.refuseForm.controls;
  }

  setDecision(): void {
    this.submitted = true;

    if (this.refuseForm.invalid) {
      return;
    }

    this.loading = true;
    const motif = this.refuseForm.value.motif as StructureDecisionRefusMotif;
    this.subscription.add(
      this.adminStructuresApiClient
        .setDecisionStructure(this.structure.id, "REFUS", motif)
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
