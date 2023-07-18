import { Directive, ElementRef, HostListener } from "@angular/core";

import { stringCleaner } from "../../../shared/string-cleaner.service";

@Directive({
  selector: "[appCleanStr]",
})
export class CleanStrDirective {
  constructor(private readonly el: ElementRef) {}

  @HostListener("keypress", ["$event"])
  public onKeyPress(event: KeyboardEvent) {
    return this.validateFields(event);
  }

  @HostListener("paste", ["$event"])
  public blockPaste(event: KeyboardEvent) {
    this.validateFields(event);
  }

  public validateFields(event: KeyboardEvent) {
    setTimeout(() => {
      this.el.nativeElement.value = stringCleaner.cleanString(
        this.el.nativeElement.value
      );
      event.preventDefault();
    }, 10);
  }
}
