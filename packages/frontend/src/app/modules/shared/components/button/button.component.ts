import { Component, EventEmitter, Input, Output } from "@angular/core";
import { IconName, IconPrefix } from "@fortawesome/fontawesome-svg-core";

@Component({
  selector: "app-button",
  templateUrl: "./button.component.html",
  styleUrls: ["./button.component.css"],
})
export class ButtonComponent {
  @Input() loading = false;
  @Input() color = "primary";

  @Input() icon?: IconName;
  @Input() prefix: IconPrefix = "fas";
  @Input() loadingText = "Patientez...";
  @Input() content = "";
  @Input() ariaLabel = "";

  @Output() readonly action = new EventEmitter<void>();
}
