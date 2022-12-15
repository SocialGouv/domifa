import { Directive, ElementRef, HostListener } from "@angular/core";

import { generateSender } from "../../structures/services";

@Directive({
  selector: "[appStrCapsAlpha]",
})
export class StrCapsAlphaDirective {
  public regexStr =
    "^[a-zA-ZÀÁÂÃÄÅàáâãäåÒÓÔÕÕÖØòóôõöøÈÉÊËèéêëðÇçÐÌÍÎÏìíîïÙÚÛÜùúûüÑñŠšŸÿýŽž 0-9\\'\\-]*$";

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
      const value = generateSender(this.el.nativeElement.value);
      this.el.nativeElement.value = value;
      event.preventDefault();
    }, 10);
  }
}
