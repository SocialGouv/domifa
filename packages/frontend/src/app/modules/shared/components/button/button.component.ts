import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
} from "@angular/core";

type ButtonType = "button" | "submit";
type ButtonColor = "primary" | "secondary" | "tertiary";
type ButtonIcon =
  | "download"
  | "trash"
  | "close"
  | "check"
  | "add"
  | "edit"
  | "arrow-right"
  | "calendar"
  | "user"
  | "phone"
  | "plus"
  | "printer"
  | "search"
  | "refresh"
  | "settings";

@Component({
  selector: "app-button",
  templateUrl: "./button.component.html",
  styleUrl: "./button.component.scss",
  standalone: false,
  host: { class: "d-print-none" },
})
export class ButtonComponent implements OnChanges {
  @Input() type: ButtonType = "button";
  @Input() loading = false;
  @Input() color: ButtonColor = "primary";
  @Input() icon?: ButtonIcon;
  @Input() loadingText = "Veuillez patienter";
  @Input() label = "";
  @Input() ariaLabel?: string;
  @Input() customClass = "";
  @Input() disabled = false;

  @Output() readonly action = new EventEmitter<void>();

  buttonClasses = "fr-btn";
  isIconOnly = false;

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
    user: "user-line",
    phone: "phone-line",
    add: "add-line",
  };

  ngOnChanges(): void {
    this.isIconOnly = !!this.icon && !this.label;

    const classes = ["fr-btn"];

    if (this.color === "secondary") {
      classes.push("fr-btn--secondary");
    } else if (this.color === "tertiary") {
      classes.push("fr-btn--tertiary");
    }

    if (this.icon && !this.loading) {
      const iconClass = `fr-icon-${this.iconMap[this.icon]}`;
      if (this.label) {
        classes.push("fr-btn--icon-left", iconClass);
      } else {
        classes.push(iconClass);
      }
    }

    if (this.customClass) {
      classes.push(this.customClass);
    }

    this.buttonClasses = classes.join(" ");
  }

  onClick(): void {
    if (!this.loading && !this.disabled) {
      this.action.emit();
    }
  }
}
