import { Directive, ElementRef, HostListener, Input } from "@angular/core";
import { DateFrDirective } from "../../shared/directives";

@Directive({
  selector: "[appDateFrConditional]",
})
export class DateFrConditionalDirective extends DateFrDirective {
  @Input() public appDateFrConditional: boolean = false;

  constructor(el: ElementRef) {
    super(el);
  }

  @HostListener("keydown", ["$event"])
  public override onKeyDown(e: KeyboardEvent) {
    if (!this.appDateFrConditional) return;
    super.onKeyDown(e);
  }

  @HostListener("keyup", ["$event"])
  public override onKeyUp(e: KeyboardEvent) {
    if (!this.appDateFrConditional) return;
    super.onKeyUp(e);
  }

  @HostListener("paste", ["$event"])
  public override onPaste(event: ClipboardEvent) {
    if (!this.appDateFrConditional) return;
    super.onPaste(event);
  }
}
