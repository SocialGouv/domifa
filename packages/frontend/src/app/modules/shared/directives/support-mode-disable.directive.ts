import {
  Directive,
  ElementRef,
  OnDestroy,
  OnInit,
  Renderer2,
} from "@angular/core";
import { Subscription } from "rxjs";
import { AuthService } from "../services/auth.service";

// Disables the host element (button, link acting as a button, etc.) and
// attaches an explanatory tooltip whenever the current session is a
// read-only admin support session. Apply to write-triggering CTAs
// (create/edit/delete, uploads, block/unblock...) — the write-blocking
// interceptor + backend guard are the actual enforcement, this is UX only.
@Directive({
  selector: "[appSupportModeDisable]",
  standalone: true,
})
export class SupportModeDisableDirective implements OnInit, OnDestroy {
  private readonly subscription = new Subscription();

  constructor(
    private readonly el: ElementRef<HTMLElement>,
    private readonly renderer: Renderer2,
    private readonly authService: AuthService
  ) {}

  public ngOnInit(): void {
    this.subscription.add(
      this.authService.currentUserSubject.subscribe((user) => {
        const disabled = user?.supportMode === true;
        if (disabled) {
          this.renderer.setAttribute(this.el.nativeElement, "disabled", "true");
          this.renderer.setAttribute(
            this.el.nativeElement,
            "title",
            "Action non disponible en mode support"
          );
          this.renderer.setAttribute(
            this.el.nativeElement,
            "aria-disabled",
            "true"
          );
        } else {
          this.renderer.removeAttribute(this.el.nativeElement, "disabled");
          this.renderer.removeAttribute(this.el.nativeElement, "aria-disabled");
        }
      })
    );
  }

  public ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
