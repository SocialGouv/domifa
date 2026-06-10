import { Directive, ElementRef, HostListener } from "@angular/core";
import { NgControl } from "@angular/forms";

@Directive({
  standalone: true,
  selector: "[appTrimUppercase]",
})
export class TrimUppercaseDirective {
  constructor(
    private readonly el: ElementRef<HTMLInputElement>,
    private readonly control: NgControl,
  ) {}

  private normalize(raw: string): string {
    return raw.replace(/\s+/g, "").toUpperCase();
  }

  @HostListener("input", ["$event"])
  onInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = this.normalize(input.value);

    if (this.control.control) {
      this.control.control.setValue(value);
    }

    input.value = value;
  }

  @HostListener("paste", ["$event"])
  onPaste(): void {
    setTimeout(() => {
      const input = this.el.nativeElement;
      const value = this.normalize(input.value);

      if (this.control.control) {
        this.control.control.setValue(value);
      }

      input.value = value;
    }, 1);
  }

  @HostListener("blur", ["$event"])
  onBlur(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = this.normalize(input.value);

    if (this.control.control) {
      this.control.control.setValue(value);
    }

    input.value = value;
  }
}
