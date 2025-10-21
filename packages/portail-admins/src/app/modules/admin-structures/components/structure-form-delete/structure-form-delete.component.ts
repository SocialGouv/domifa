import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  Output,
} from "@angular/core";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import {
  StructureDecisionRefusMotif,
  MOTIFS_SUPPRESSION_STRUCTURE_LABELS,
} from "@domifa/common";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
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
    public activeModal: NgbActiveModal,
    private readonly adminStructuresApiClient: AdminStructuresApiClient
  ) {
    this.initForm();
  }

  initForm(): void {
    this.deleteForm = this.fb.group({
      motif: ["", Validators.required],
    });
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
    this.activeModal.dismiss();
    this.closeModals.emit();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
