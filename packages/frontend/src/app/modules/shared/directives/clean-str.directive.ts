import { Directive, ElementRef, HostListener } from "@angular/core";

import { stringCleaner } from "../../../shared/string-cleaner.service";

@Directive({
  selector: "[appCleanStr]",
})
export class CleanStrDirective {
  public regexStr =
    "^[a-zA-ZÀÁÂÃÄÅàáâãäåÒÓÔÕÕÖØòóôõöøÈÉÊËèéêëðÇçÐÌÍÎÏìíîïÙÚÛÜùúûüÑñŠšŸÿýŽž 0-9\\'\\-]*$";

  constructor(private readonly el: ElementRef) {}

  @HostListener("keypress", ["$event"])
  public onKeyPress(event: KeyboardEvent) {
    return new RegExp(this.regexStr).test(event.key);
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
    }, 100);
  }
}
