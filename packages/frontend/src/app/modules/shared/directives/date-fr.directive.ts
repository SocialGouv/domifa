import { Directive, ElementRef, HostListener } from "@angular/core";

@Directive({
  selector: "[appDateFr]",
})
export class DateFrDirective {
  constructor(private el: ElementRef) {}

  @HostListener("input", ["$event"])
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onInput(event: any): void {
    const input = this.el.nativeElement as HTMLInputElement;
    const isBackspace = event?.inputType && event?.inputType.includes("delete");
    const value = input.value;
    const cursorPosition = input.selectionStart;
    const originalLength = value.length;

    let cleanValue = value.replace(/\D/g, "");

    if (cleanValue.length > 8) {
      cleanValue = cleanValue.substring(0, 8);
    }

    if (cleanValue.length >= 2) {
      const shouldAddSlash = cleanValue.length > 2 || !isBackspace;

      if (shouldAddSlash) {
        cleanValue = cleanValue.substring(0, 2) + "/" + cleanValue.substring(2);
      }
    }

    if (cleanValue.length >= 5) {
      const shouldAddSlash = cleanValue.length > 5 || !isBackspace;

      if (shouldAddSlash) {
        cleanValue = cleanValue.substring(0, 5) + "/" + cleanValue.substring(5);
      }
    }

    input.value = cleanValue;

    if (cursorPosition !== null && cursorPosition < originalLength) {
      input.setSelectionRange(cursorPosition, cursorPosition);
    }
  }

  @HostListener("keydown", ["$event"])
  onKeyDown(e: KeyboardEvent): void {
    const allowedKeys = [
      "Backspace",
      "Tab",
      "End",
      "Home",
      "ArrowLeft",
      "ArrowRight",
      "Delete",
      "Enter",
    ];

    if (allowedKeys.indexOf(e.key) !== -1 || e.ctrlKey || e.metaKey) {
      return;
    }

    if (!/^\d$/.test(e.key)) {
      e.preventDefault();
    }
  }
}
