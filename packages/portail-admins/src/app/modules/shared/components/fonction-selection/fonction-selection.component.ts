import { Subscription } from "rxjs";
import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from "@angular/core";
import { AbstractControl, UntypedFormGroup, Validators } from "@angular/forms";
import { USER_FONCTION_LABELS } from "@domifa/common/src/users/user-structure/constants/USER_FONCTION_LABELS.const";

@Component({
  selector: "app-fonction-selection",
  templateUrl: "./fonction-selection.component.html",
})
export class FonctionSelectionComponent implements OnInit, OnDestroy {
  @Input({ required: true }) public submitted!: boolean;

  @Input() public parentFormGroup!: UntypedFormGroup;
  @Input() public fonctionFormControl!: AbstractControl;
  @Input() public detailFonctionFormControl!: AbstractControl;
  @Input({ required: true }) public invalidFeedbackText: string;
  @Input() public required = false;
  @Input() public label = "Fonction";
  @Input() public displayLabel = true;

  @Output() outputFunction = new EventEmitter<string | null>();
  public fonction: string | null = null;
  public detailFonction: string | null = null;
  public compareOriginalOrder = () => 0;
  public readonly USER_FONCTION_LABELS = USER_FONCTION_LABELS;

  private subscription = new Subscription();

  ngOnInit(): void {
    this.fonction = this.fonctionFormControl.value;
    this.detailFonction = this.detailFonctionFormControl?.value ?? null;

    this.fonctionFormControl.valueChanges.subscribe((value) => {
      if (value === "Autre") {
        this.detailFonctionFormControl?.setValidators(Validators.required);
      } else {
        this.detailFonctionFormControl.setValue(null);
        this.detailFonctionFormControl?.clearValidators();
      }
      this.detailFonctionFormControl?.updateValueAndValidity();
    });
  }

  public onModelChange(attribute: string, event: string | null) {
    if (this.parentFormGroup) {
      this.parentFormGroup.controls[attribute].setValue(event);
    } else {
      this.outputFunction.emit(event);
    }
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
