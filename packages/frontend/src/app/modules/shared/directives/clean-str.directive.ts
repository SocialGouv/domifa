import { Directive, ElementRef, HostListener, Renderer2 } from "@angular/core";

import { stringCleaner } from "../../../shared/string-cleaner.service";
import { NgControl } from "@angular/forms";

@Directive({
  selector: "[appCleanStr]",
})
export class CleanStrDirective {
  constructor(
    private readonly el: ElementRef,
    private renderer: Renderer2,
    private control: NgControl
  ) {}

  @HostListener("paste", ["$event"])
  @HostListener("input", ["$event"])
  @HostListener("keypress", ["$event"])
  onInputChange(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    const cleanedValue = stringCleaner.cleanString(inputElement.value);
    this.renderer.setProperty(inputElement, "value", cleanedValue);
    this.renderer.setProperty(this.el.nativeElement, "value", cleanedValue);
    this.control.control.setValue(cleanedValue, { emitEvent: false });
    this.control.control.updateValueAndValidity({
      onlySelf: true,
      emitEvent: false,
    });
  }
}
