import {
  Directive,
  ElementRef,
  OnInit,
  OnDestroy,
  Renderer2,
  NgZone,
} from "@angular/core";
import { fromEvent, Subject } from "rxjs";
import { takeUntil, throttleTime } from "rxjs/operators";

@Directive({
  selector: "[appStickySelectionBar]",
})
export class StickySelectionBarDirective implements OnInit, OnDestroy {
  private isSticky = false;
  private elementPosition: number | null = null;
  private destroy$ = new Subject<void>();

  constructor(
    private el: ElementRef,
    private renderer: Renderer2,
    private ngZone: NgZone
  ) {}

  ngOnInit() {
    this.elementPosition =
      this.el.nativeElement.getBoundingClientRect().top + window.scrollY;

    this.ngZone.runOutsideAngular(() => {
      fromEvent(window, "scroll")
        .pipe(throttleTime(10), takeUntil(this.destroy$))
        .subscribe(() => {
          this.checkStickyState();
        });
    });
  }

  private checkStickyState(): void {
    if (!this.elementPosition) return;

    const scrollPosition = window.scrollY;
    const shouldBeSticky = scrollPosition > this.elementPosition;

    if (shouldBeSticky !== this.isSticky) {
      this.ngZone.run(() => {
        if (shouldBeSticky) {
          this.renderer.addClass(this.el.nativeElement, "is-sticky");
        } else {
          this.renderer.removeClass(this.el.nativeElement, "is-sticky");
        }
        this.isSticky = shouldBeSticky;
      });
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
