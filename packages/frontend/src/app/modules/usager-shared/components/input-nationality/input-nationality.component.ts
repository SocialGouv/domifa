import { Component, Input } from "@angular/core";
import { UntypedFormGroup } from "@angular/forms";
import { COUNTRIES, Usager } from "@domifa/common";

@Component({
  selector: "app-input-nationality",
  templateUrl: "./input-nationality.component.html",
  styleUrls: ["./input-nationality.component.css"],
})
export class InputNationalityComponent {
  @Input() public parentFormGroup!: UntypedFormGroup;
  @Input() public submitted!: boolean;
  @Input() public usager!: Usager;

  public readonly COUNTRIES = Object.values(COUNTRIES);

  public updateParentFormControl(event: string) {
    this.parentFormGroup.controls.nationalite.setValue(event);
  }
}
