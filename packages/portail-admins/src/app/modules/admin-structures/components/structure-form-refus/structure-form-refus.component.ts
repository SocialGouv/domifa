import { Component, EventEmitter, Input, Output } from "@angular/core";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { MOTIFS_REFUS_STRUCTURE_LABELS, Structure } from "@domifa/common";
import { StructureDecision } from "@domifa/common/dist/structure/interfaces/StructureDecision.interface";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { AdminAuthService } from "../../../admin-auth/services/admin-auth.service";

@Component({
  selector: "app-structure-form-refus",
  standalone: true,
  imports: [],
  templateUrl: "./structure-form-refus.component.html",
  styleUrl: "./structure-form-refus.component.css",
})
export class StructureFormRefusComponent {
  @Input() structure: Structure;
  @Output() closeModals = new EventEmitter<void>();
  @Output() confirmRefus = new EventEmitter<StructureDecision>();

  refusForm: FormGroup;
  submitted = false;
  loading = false;

  public readonly MOTIFS_REFUS_STRUCTURE_LABELS = MOTIFS_REFUS_STRUCTURE_LABELS;

  constructor(
    private fb: FormBuilder,
    public activeModal: NgbActiveModal,
    private readonly authService: AdminAuthService
  ) {
    this.initForm();
  }

  initForm(): void {
    this.refusForm = this.fb.group({
      motif: ["", Validators.required],
      motifDetails: [""],
    });

    // Validation conditionnelle pour motifDetails
    this.refusForm.get("motif")?.valueChanges.subscribe((value) => {
      const motifDetailsControl = this.refusForm.get("motifDetails");
      if (value === "AUTRE") {
        motifDetailsControl?.setValidators([
          Validators.required,
          Validators.minLength(10),
        ]);
      } else {
        motifDetailsControl?.clearValidators();
      }
      motifDetailsControl?.updateValueAndValidity();
    });
  }

  get r() {
    return this.refusForm.controls;
  }

  setDecisionRefus(): void {
    this.submitted = true;

    if (this.refusForm.invalid) {
      return;
    }

    this.loading = true;

    const decision: StructureDecision = {
      uuid: this.structure?.uuid,
      dateDecision: new Date(),
      statut: "REFUS",
      motif:
        this.refusForm.value.motif !== "AUTRE"
          ? this.refusForm.value.motif
          : null,
      motifDetails:
        this.refusForm.value.motif === "AUTRE"
          ? this.refusForm.value.motifDetails
          : undefined,
      userId: 0, // À remplacer par l'ID de l'utilisateur connecté
      userName: "", // À remplacer par le nom de l'utilisateur connecté
    };

    this.confirmRefus.emit(decision);
  }

  close(): void {
    this.activeModal.dismiss();
    this.closeModals.emit();
  }
}
