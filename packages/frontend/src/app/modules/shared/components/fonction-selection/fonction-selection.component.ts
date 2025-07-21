import { Subscription } from "rxjs";
import { Component, Input, OnDestroy, OnInit } from "@angular/core";
import { AbstractControl, UntypedFormGroup, Validators } from "@angular/forms";
import { USER_FONCTION_LABELS, UserFonction } from "@domifa/common";
enum CONTROL_OPTIONS {
  "FONCTION" = "FONCTION",
  "DETAIL_FONCTION" = "DETAIL_FONCTION",
}
@Component({
  selector: "app-fonction-selection",
  templateUrl: "./fonction-selection.component.html",
})
export class FonctionSelectionComponent implements OnInit, OnDestroy {
  @Input({ required: true }) public submitted!: boolean;

  @Input() public parentFormGroup!: UntypedFormGroup;
  @Input() public fonctionFormControl!: AbstractControl;
  @Input() public fonctionDetailFormControl!: AbstractControl;
  @Input({ required: true }) public invalidFeedbackText: string;
  @Input() public required = false;
  @Input() public label = "Fonction";
  @Input() public displayLabel = true;

  public fonction: string | null = null;
  public fonctionDetail: string | null = null;
  public compareOriginalOrder = () => 0;
  public readonly USER_FONCTION_LABELS = USER_FONCTION_LABELS;
  public readonly USER_FONCTION = UserFonction;
  public readonly CONTROL_OPTIONS = CONTROL_OPTIONS;
  private subscription = new Subscription();

  ngOnInit(): void {
    this.fonction = this.fonctionFormControl.value;
    this.fonctionDetail = this.fonctionDetailFormControl?.value ?? null;
    this.subscription.add(
      this.fonctionFormControl.valueChanges.subscribe((value) => {
        this.fonction = value;
        if (value === UserFonction.AUTRE) {
          this.fonctionDetailFormControl?.setValidators(Validators.required);
        } else {
          this.fonctionDetailFormControl?.setValue(null);
          this.fonctionDetailFormControl?.clearValidators();
        }
        this.fonctionDetailFormControl?.updateValueAndValidity();
      })
    );

    this.subscription.add(
      this.fonctionDetailFormControl?.valueChanges.subscribe((value) => {
        this.fonctionDetail = value;
      })
    );
  }

  public onModelChange(attribute: string, event: string | null) {
    if (attribute === CONTROL_OPTIONS.FONCTION) {
      this.fonctionFormControl?.setValue(event);
    } else if (attribute === CONTROL_OPTIONS.DETAIL_FONCTION) {
      this.fonctionDetailFormControl?.setValue(event);
    } else {
      throw new Error("Attribute not supported for fonction component");
    }
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
