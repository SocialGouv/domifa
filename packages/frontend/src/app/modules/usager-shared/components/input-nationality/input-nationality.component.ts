import { Component, Input } from "@angular/core";
import { UntypedFormGroup } from "@angular/forms";
import { COUNTRIES } from "@domifa/common";
import { UsagerFormModel } from "../../interfaces";

@Component({
  selector: "app-input-nationality",
  templateUrl: "./input-nationality.component.html",
  styleUrls: ["./input-nationality.component.css"],
})
export class InputNationalityComponent {
  @Input({ required: true }) public parentFormGroup!: UntypedFormGroup;
  @Input({ required: true }) public submitted!: boolean;
  @Input({ required: true }) public usager!: UsagerFormModel;

  public readonly COUNTRIES = Object.values(COUNTRIES);

  public updateParentFormControl(event: string) {
    this.parentFormGroup.controls.nationalite.setValue(event);
  }
}
