import {
  Directive,
  ElementRef,
  OnDestroy,
  OnInit,
  Renderer2,
} from "@angular/core";
import { Subscription } from "rxjs";
import { AuthService } from "../services/auth.service";

const TOOLTIP = "Action non disponible en mode support";

// Disables the host element (button, link, custom `<app-button>`, DSFR
// dropdown item, etc.) whenever the current session is a read-only admin
// support session. Apply to write-triggering CTAs (create/edit/delete,
// uploads, block/unblock...) — the write-blocking interceptor + backend
// guard are the actual enforcement, this is UX only.
//
// The click is intercepted in the CAPTURE phase on the host element itself,
// not via the `disabled` attribute/property: several targets (`<app-button>`,
// DSFR dropdown items) attach their own click listener on an element nested
// *inside* the host, and many hosts already bind their own
// `[disabled]="loading"` expression that Angular re-asserts on every change
// detection run — fighting that with `Renderer2.setAttribute` would get
// silently overwritten. A capture-phase listener on the host always runs
// before any nested/bubble listener, regardless of the host's own bindings.
@Directive({
  selector: "[appSupportModeDisable]",
  standalone: true,
})
export class SupportModeDisableDirective implements OnInit, OnDestroy {
  private readonly subscription = new Subscription();
  private isSupportMode = false;

  constructor(
    private readonly el: ElementRef<HTMLElement>,
    private readonly renderer: Renderer2,
    private readonly authService: AuthService
  ) {}

  public ngOnInit(): void {
    this.el.nativeElement.addEventListener("click", this.onCaptureClick, {
      capture: true,
    });

    this.subscription.add(
      this.authService.currentUserSubject.subscribe((user) => {
        this.isSupportMode = user?.supportMode === true;
        if (this.isSupportMode) {
          this.renderer.setAttribute(
            this.el.nativeElement,
            "aria-disabled",
            "true"
          );
          this.renderer.setAttribute(this.el.nativeElement, "title", TOOLTIP);
          this.renderer.setStyle(this.el.nativeElement, "opacity", "0.5");
          this.renderer.setStyle(
            this.el.nativeElement,
            "cursor",
            "not-allowed"
          );
        } else {
          this.renderer.removeAttribute(this.el.nativeElement, "aria-disabled");
          this.renderer.removeAttribute(this.el.nativeElement, "title");
          this.renderer.removeStyle(this.el.nativeElement, "opacity");
          this.renderer.removeStyle(this.el.nativeElement, "cursor");
        }
      })
    );
  }

  public ngOnDestroy(): void {
    this.el.nativeElement.removeEventListener("click", this.onCaptureClick, {
      capture: true,
    });
    this.subscription.unsubscribe();
  }

  private readonly onCaptureClick = (event: Event): void => {
    if (this.isSupportMode) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  };
}
