import { Directive, ElementRef, HostListener } from "@angular/core";
import { NgControl } from "@angular/forms";

@Directive({
  standalone: true,
  selector: "[appUppercase]",
})
export class UppercaseDirective {
  constructor(
    private readonly el: ElementRef<HTMLInputElement>,
    private readonly control: NgControl,
  ) {}

  @HostListener("input", ["$event"])
  onInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = input.value.toUpperCase();

    if (this.control.control) {
      this.control.control.setValue(value);
    }

    input.value = value;
  }

  @HostListener("paste", ["$event"])
  onPaste(): void {
    setTimeout(() => {
      const input = this.el.nativeElement;
      const value = input.value.toUpperCase();

      // Met à jour la valeur du FormControl
      if (this.control.control) {
        this.control.control.setValue(value);
      }

      // Met à jour l'affichage
      input.value = value;
    }, 1);
  }

  @HostListener("blur", ["$event"])
  onBlur(event: Event): void {
    // Assure la transformation même si l'utilisateur quitte le champ
    const input = event.target as HTMLInputElement;
    const value = input.value.toUpperCase();

    if (this.control.control) {
      this.control.control.setValue(value);
    }

    input.value = value;
  }
}
