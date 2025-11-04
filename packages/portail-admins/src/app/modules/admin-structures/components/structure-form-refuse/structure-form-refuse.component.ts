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
  ReactiveFormsModule,
} from "@angular/forms";
import {
  StructureDecisionRefusMotif,
  MOTIFS_REFUS_STRUCTURE_LABELS,
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
  selector: "app-structure-form-refuse",
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DsfrModalModule,
    DsfrButtonModule,
    DsfrButtonsGroupModule,
  ],
  templateUrl: "./structure-form-refuse.component.html",
})
export class StructureFormRefuseComponent
  implements OnInit, OnDestroy, AfterViewInit
{
  @Input() public structure!: StructureAdmin | null;
  @Output() public readonly closeModals = new EventEmitter<void>();
  @Output() public readonly refuseSuccess = new EventEmitter<void>();

  public refuseForm!: FormGroup;
  public submitted = false;
  public loading = false;

  private readonly subscription = new Subscription();

  get f(): { [key: string]: AbstractControl } {
    return this.refuseForm.controls;
  }

  public readonly MOTIFS_REFUS_STRUCTURE_LABELS = MOTIFS_REFUS_STRUCTURE_LABELS;

  public motifs = Object.entries(MOTIFS_REFUS_STRUCTURE_LABELS).map(
    ([key, label]) => ({
      key,
      label,
    })
  );

  @ViewChild(DsfrModalComponent) refuseStructureModal!: DsfrModalComponent;

  constructor(
    private fb: FormBuilder,
    private readonly adminStructuresApiClient: AdminStructuresApiClient
  ) {}

  ngOnInit(): void {
    this.initForm();
  }

  ngAfterViewInit(): void {
    console.log(this.refuseStructureModal);
    this.openModal();
  }

  private initForm(): void {
    this.refuseForm = this.fb.group({
      motif: ["", Validators.required],
    });
  }

  public opened(): void {
    setTimeout(() => {
      const element = document.getElementById("motifRefus");
      if (element) {
        element.focus();
      }
    }, 100);
  }

  public openModal(): void {
    if (!this.structure) {
      return;
    }

    this.resetForm();

    setTimeout(() => {
      this.refuseStructureModal.open();
    }, 100);
  }

  public closeModal(): void {
    this.resetForm();
    if (this.refuseStructureModal) {
      this.closeModals.emit();
    }
  }

  private resetForm(): void {
    this.refuseForm.reset({
      motif: "",
      statutDetail: "",
    });
    this.submitted = false;
    this.loading = false;
  }

  public setDecision(): void {
    if (!this.structure) return;

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
            this.refuseSuccess.emit();
            this.closeModal();
          },
          error: (error) => {
            this.loading = false;
            console.error("Erreur lors du refus:", error);
          },
        })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
