import { Directive, ElementRef, HostListener, Input } from "@angular/core";
import { stringCleaner } from "../../../shared/string-cleaner.service";
@Directive({
  selector: "[cleanStr]",
})
export class CleanStrDirective {
  regexStr =
    "^[a-zA-ZÀÁÂÃÄÅàáâãäåÒÓÔÕÕÖØòóôõöøÈÉÊËèéêëðÇçÐÌÍÎÏìíîïÙÚÛÜùúûüÑñŠšŸÿýŽž 0-9\\'\\-]*$";
  @Input() isAlphaNumeric: boolean;

  constructor(private el: ElementRef) {}

  @HostListener("keypress", ["$event"]) onKeyPress(event: any) {
    return new RegExp(this.regexStr).test(event.key);
  }

  @HostListener("paste", ["$event"]) blockPaste(event: KeyboardEvent) {
    this.validateFields(event);
  }

  validateFields(event) {
    setTimeout(() => {
      this.el.nativeElement.value = stringCleaner.cleanString(
        this.el.nativeElement.value
      );
      event.preventDefault();
    }, 100);
  }
}
