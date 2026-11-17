import { Component, Input } from "@angular/core";
import { AbstractControl, UntypedFormGroup } from "@angular/forms";

// Name of the boolean control (Validators.requiredTrue) the parent form must declare
export const GENERIC_EMAIL_ACKNOWLEDGEMENT_CONTROL = "genericEmailAcknowledged";

@Component({
  selector: "app-generic-email-acknowledgement",
  templateUrl: "./generic-email-acknowledgement.component.html",
  standalone: false,
})
export class GenericEmailAcknowledgementComponent {
  @Input() public submitted = false;
  @Input() public parentFormGroup!: UntypedFormGroup;
  @Input() public showWarning = true;

  public readonly controlName = GENERIC_EMAIL_ACKNOWLEDGEMENT_CONTROL;

  public get control(): AbstractControl | null {
    return this.parentFormGroup?.get(this.controlName) ?? null;
  }

  public get hasError(): boolean {
    return this.submitted && !!this.control?.errors;
  }
}
