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

  @HostListener("input", ["$event"])
  public override onInput(event: Event) {
    if (!this.appDateFrConditional) return;

    super.onInput(event);
  }

  @HostListener("keydown", ["$event"])
  public override onKeyDown(e: KeyboardEvent) {
    if (!this.appDateFrConditional) return;
    super.onKeyDown(e);
  }
}
