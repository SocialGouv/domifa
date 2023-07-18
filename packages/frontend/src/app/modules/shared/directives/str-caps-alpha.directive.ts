import { Directive, ElementRef, HostListener } from "@angular/core";
import { generateSender } from "../../structures/utils/generateSender.service";

@Directive({
  selector: "[appStrCapsAlpha]",
})
export class StrCapsAlphaDirective {
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
