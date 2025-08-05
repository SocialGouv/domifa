import { Directive, HostListener } from "@angular/core";

@Directive({
  selector: "[appDigitOnly]",
  standalone: true,
})
export class DigitOnlyDirective {
  constructor() {}

  @HostListener("input", ["$event"])
  public onInput(event: Event) {
    const input = event.target as HTMLInputElement;
    const cleanValue = input.value.replace(/\D/g, "");

    if (input.value !== cleanValue) {
      input.value = cleanValue;
    }
  }

  @HostListener("paste", ["$event"])
  public onPaste(event: ClipboardEvent) {
    event.preventDefault();
    const pastedText = event.clipboardData?.getData("text") || "";
    const cleanValue = pastedText.replace(/\D/g, "");

    const input = event.target as HTMLInputElement;
    input.value = cleanValue;
    input.dispatchEvent(new Event("input"));
  }
}
