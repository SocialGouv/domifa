import { AfterViewChecked, Directive, ElementRef } from "@angular/core";

// ngx-dsfr-ext 1.8.2 renders the dsfr-ext-spinner icon as an <svg> without
// aria-hidden: it is decorative, the spinner label already gives the information.
// The host cannot be hidden since the label is rendered inside the component (RGAA 1.2)
@Directive({
  selector: "dsfr-ext-spinner[appSpinnerAriaHidden]",
})
export class SpinnerAriaHiddenDirective implements AfterViewChecked {
  constructor(private readonly elementRef: ElementRef<HTMLElement>) {}

  // checked after each rendering: the svg changes with the typeLoader input
  public ngAfterViewChecked(): void {
    this.elementRef.nativeElement
      .querySelectorAll("svg:not([aria-hidden])")
      .forEach((svg) => {
        svg.setAttribute("aria-hidden", "true");
        svg.setAttribute("focusable", "false");
      });
  }
}
