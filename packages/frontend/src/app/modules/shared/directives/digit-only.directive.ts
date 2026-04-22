import { Directive, HostListener, Optional, Self } from "@angular/core";
import { NgControl } from "@angular/forms";

@Directive({
  selector: "[appDigitOnly]",
  standalone: true,
})
export class DigitOnlyDirective {
  constructor(@Optional() @Self() private readonly ngControl: NgControl) {}

  @HostListener("input", ["$event"])
  public onInput(event: Event) {
    const input = event.target as HTMLInputElement;
    const cleanValue = input.value.replace(/\D/g, "");

    if (input.value !== cleanValue) {
      input.value = cleanValue;
      this.ngControl?.control?.setValue(cleanValue, { emitEvent: true });
    }
  }

  @HostListener("paste", ["$event"])
  public onPaste(event: ClipboardEvent) {
    event.preventDefault();
    const pastedText = event.clipboardData?.getData("text") || "";
    const cleanValue = pastedText.replace(/\D/g, "");

    const input = event.target as HTMLInputElement;
    input.value = cleanValue;
    this.ngControl?.control?.setValue(cleanValue, { emitEvent: true });
  }
}
