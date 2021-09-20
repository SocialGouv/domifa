import { Directive, ElementRef, HostListener, Input } from "@angular/core";
import { cleanString } from "../../../shared/utils/string-cleaner";

@Directive({
  selector: "[cleanStr]",
})
export class CleanStrDirective {
  regexStr =
    "^[a-zA-ZÀÁÂÃÄÅàáâãäåÒÓÔÕÕÖØòóôõöøÈÉÊËèéêëðÇçÐÌÍÎÏìíîïÙÚÛÜùúûüÑñŠšŸÿýŽž 0-9\\'\\-]*$";
  constructor(private el: ElementRef) {}

  @HostListener("keypress", ["$event"]) onKeyPress(event: KeyboardEvent) {
    return new RegExp(this.regexStr).test(event.key);
  }

  @HostListener("paste", ["$event"]) blockPaste(event: KeyboardEvent) {
    this.validateFields(event);
  }

  validateFields(event: KeyboardEvent) {
    setTimeout(() => {
      this.el.nativeElement.value = cleanString(this.el.nativeElement.value);
      event.preventDefault();
    }, 100);
  }
}
