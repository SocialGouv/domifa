import { Component, EventEmitter, Input, Output } from "@angular/core";

type ButtonColor = "primary" | "secondary" | "danger" | "tertiary";
type ButtonIcon =
  | "download"
  | "trash"
  | "close"
  | "check"
  | "edit"
  | "arrow-right"
  | "calendar"
  | "plus"
  | "printer"
  | "search"
  | "refresh"
  | "settings";

@Component({
  selector: "app-button",
  templateUrl: "./button.component.html",
  styleUrl: "./button.component.scss",
})
export class ButtonComponent {
  @Input() loading = false;
  @Input() color: ButtonColor = "primary";
  @Input() icon?: ButtonIcon;
  @Input() loadingText = "Patientez...";
  @Input() content = "";
  @Input() ariaLabel = "";

  @Output() readonly action = new EventEmitter<void>();

  readonly iconMap: Record<ButtonIcon, string> = {
    download: "download-line",
    trash: "delete-line",
    close: "close-line",
    check: "check-line",
    edit: "edit-line",
    "arrow-right": "arrow-right-line",
    calendar: "calendar-line",
    plus: "add-line",
    printer: "printer",
    search: "search-line",
    refresh: "refresh-line",
    settings: "settings-line",
  };
}
