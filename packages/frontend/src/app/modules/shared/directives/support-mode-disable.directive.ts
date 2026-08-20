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
const FIELD_SELECTOR = "input, select, textarea";

// Disables the host element (button, link, custom `<app-button>`, DSFR
// dropdown item, or a whole `<form>`) whenever the current session is a
// read-only admin support session. Apply to write-triggering CTAs
// (create/edit/delete, uploads, block/unblock...) — the write-blocking
// interceptor + backend guard are the actual enforcement, this is UX only.
//
// The click is intercepted in the CAPTURE phase on the host element itself,
// not via the `disabled` attribute/property: several targets (`<app-button>`,
// DSFR dropdown items) attach their own click listener on an element nested
// *inside* the host, and many hosts already bind their own
// `[disabled]="loading"` expression that Angular re-asserts on every change
// detection run — fighting that with `Renderer2.setAttribute` would get
// silently overwritten. A capture-phase listener on the host always runs
// before any nested/bubble listener, regardless of the host's own bindings.
//
// When the host is a `<form>`, the directive ALSO sets the native
// `disabled` property on every descendant input/select/textarea, so the
// form reads as genuinely read-only (not just "the submit button is
// blocked"). This only ever touches the plain `disabled` DOM property —
// never `FormControl.disable()` — so it can't strip fields out of the
// reactive form's value, skip validators, or otherwise change submit
// behaviour once support mode ends. A MutationObserver keeps catching
// fields added after the fact (FormArray rows, conditionally-rendered
// sections) for as long as support mode stays active.
@Directive({
  selector: "[appSupportModeDisable]",
  standalone: true,
})
export class SupportModeDisableDirective implements OnInit, OnDestroy {
  private readonly subscription = new Subscription();
  private isSupportMode = false;
  private mutationObserver?: MutationObserver;
  private readonly fieldsDisabledByUs = new Set<
    HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
  >();

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
          this.startDisablingFormFields();
        } else {
          this.renderer.removeAttribute(this.el.nativeElement, "aria-disabled");
          this.renderer.removeAttribute(this.el.nativeElement, "title");
          this.renderer.removeStyle(this.el.nativeElement, "opacity");
          this.renderer.removeStyle(this.el.nativeElement, "cursor");
          this.stopDisablingFormFields();
        }
      })
    );
  }

  public ngOnDestroy(): void {
    this.el.nativeElement.removeEventListener("click", this.onCaptureClick, {
      capture: true,
    });
    this.subscription.unsubscribe();
    this.mutationObserver?.disconnect();
  }

  private readonly onCaptureClick = (event: Event): void => {
    if (this.isSupportMode) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  };

  private startDisablingFormFields(): void {
    if (this.el.nativeElement.tagName !== "FORM") {
      return;
    }
    this.disableFields();
    this.mutationObserver ??= new MutationObserver(() => this.disableFields());
    this.mutationObserver.observe(this.el.nativeElement, {
      childList: true,
      subtree: true,
    });
  }

  private stopDisablingFormFields(): void {
    this.mutationObserver?.disconnect();
    for (const field of this.fieldsDisabledByUs) {
      field.disabled = false;
    }
    this.fieldsDisabledByUs.clear();
  }

  private disableFields(): void {
    const fields = this.el.nativeElement.querySelectorAll<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >(FIELD_SELECTOR);
    fields.forEach((field) => {
      if (!field.disabled) {
        field.disabled = true;
        this.fieldsDisabledByUs.add(field);
      }
    });
  }
}
