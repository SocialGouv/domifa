import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { AbstractControl, UntypedFormGroup } from "@angular/forms";
import { USER_FONCTION_LABELS } from "@domifa/common/src/users/user-structure/constants/USER_FONCTION_LABELS.const";

@Component({
  selector: "app-fonction-selection",
  templateUrl: "./fonction-selection.component.html",
})
export class FonctionSelectionComponent implements OnInit {
  @Input({ required: true }) public submitted!: boolean;

  @Input() public parentFormGroup!: UntypedFormGroup;
  @Input() public fonctionFormControl!: AbstractControl;
  @Input() public fonction: string | null = null;
  @Input({ required: true }) public invalidFeedbackText: string;
  @Input() public required = false;
  @Input() public label = "Fonction";
  @Input() public displayLabel = true;

  @Output() outputFunction = new EventEmitter<string | null>();
  public compareOriginalOrder = () => 0;
  public readonly USER_FONCTION_LABELS = USER_FONCTION_LABELS;

  ngOnInit(): void {
    this.fonction = this.fonctionFormControl.value;
  }

  public onModelChange(event: string | null) {
    if (this.parentFormGroup) {
      this.fonctionFormControl.setValue(event);
    } else {
      this.outputFunction.emit(event);
    }
  }
}
