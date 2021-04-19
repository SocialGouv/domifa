import { UsagerFormModel } from "./../form/UsagerFormModel";
import { UsagerLight } from "./../../../../../_common/model/usager/UsagerLight.type";
import { Component, Input, OnInit } from "@angular/core";

@Component({
  selector: "app-set-interaction-form",
  templateUrl: "./set-interaction-form.component.html",
  styleUrls: ["./set-interaction-form.component.css"],
})
export class SetInteractionFormComponent implements OnInit {
  @Input() public usager: UsagerFormModel;

  constructor() {}

  public ngOnInit(): void {}
}
