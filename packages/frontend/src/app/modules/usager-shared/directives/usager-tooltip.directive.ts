import { Directive, HostListener, Input, OnDestroy } from "@angular/core";
import { NgbTooltip } from "@ng-bootstrap/ng-bootstrap";
import { Subscription } from "rxjs";
import { TooltipControlService } from "../services/tooltip-control.service";

@Directive({
  selector: "[appTooltip]",
})
export class TooltipDirective implements OnDestroy {
  @Input("appTooltip") public tooltip: NgbTooltip;
  public mouseIsInsideTooltipContent = false;
  private readonly subscription: Subscription;

  constructor(private readonly tooltipControlService: TooltipControlService) {
    this.subscription =
      this.tooltipControlService.closeTooltipsSubject.subscribe(() => {
        this.closeTooltip();
      });
  }

  @HostListener("mouseleave")
  onMouseLeave() {
    this.mouseIsInsideTooltipContent = false;
  }

  @HostListener("document:click", ["$event"])
  clickout() {
    if (!this.mouseIsInsideTooltipContent) {
      this.closeTooltip();
    }
  }

  @HostListener("document:keydown", ["$event"])
  onKeydownHandler(event: KeyboardEvent) {
    if (event.key === "Escape") {
      this.closeTooltip();
    }
  }

  @HostListener("focus")
  @HostListener("click")
  @HostListener("mouseenter")
  openToolTip() {
    this.tooltipControlService.closeTooltips();
    this.mouseIsInsideTooltipContent = true;
    if (!this.tooltip?.isOpen()) {
      this.tooltip.open();
    }
  }

  closeTooltip() {
    if (this.tooltip?.isOpen()) {
      this.mouseIsInsideTooltipContent = false;
      this.tooltip.close();
    }
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
