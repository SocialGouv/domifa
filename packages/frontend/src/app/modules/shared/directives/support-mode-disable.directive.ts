import {
  Directive,
  ElementRef,
  OnDestroy,
  OnInit,
  Renderer2,
} from "@angular/core";
import { AuthService } from "../services/auth.service";

const TOOLTIP = "Action non disponible en mode support";
const FIELD_SELECTOR = "input, select, textarea";

// Disables the host element (button, link, custom `<app-button>`, DSFR
// dropdown item, or a whole `<form>`) whenever the current session is a
// read-only admin support session. Apply to write-triggering CTAs
// (create/edit/delete, uploads, block/unblock...) — the write-blocking
// interceptor + backend guard are the actual enforcement, this is UX only.
//
// PERF NOTE: support-mode state (role === "support") is read ONCE,
// synchronously, in ngOnInit — no BehaviorSubject subscription. This is safe
// because a support session never flips on/off while a tagged component
// stays mounted: activation happens via a fresh login (full Angular app
// bootstrap), and this directive is only ever applied inside routed content
// — every exit path (manual "Quitter", auto-expiry) navigates to /connexion,
// which tears down and unmounts that routed content, taking any tagged
// element with it. If that assumption ever stops holding, this directive
// would need to go back to a live subscription.
// When the session is NOT support-mode (the overwhelming majority of the
// time, for every regular user), ngOnInit is a single property read and
// nothing else — no listener attached, no DOM write, no observer. This
// directive is applied to elements that can appear hundreds of times on
// one page (e.g. a row action rendered per usager in the dossiers table),
// so keeping the non-support-mode path free is what makes that viable.
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
    this.isSupportMode = this.authService.currentUserValue?.role === "support";
    if (!this.isSupportMode) {
      return;
    }

    this.el.nativeElement.addEventListener("click", this.onCaptureClick, {
      capture: true,
    });

    this.renderer.setAttribute(this.el.nativeElement, "aria-disabled", "true");
    this.renderer.setAttribute(this.el.nativeElement, "title", TOOLTIP);
    this.renderer.setStyle(this.el.nativeElement, "opacity", "0.5");
    this.renderer.setStyle(this.el.nativeElement, "cursor", "not-allowed");
    this.startDisablingFormFields();
  }

  public ngOnDestroy(): void {
    if (!this.isSupportMode) {
      return;
    }
    this.el.nativeElement.removeEventListener("click", this.onCaptureClick, {
      capture: true,
    });
    this.mutationObserver?.disconnect();
  }

  private readonly onCaptureClick = (event: Event): void => {
    event.preventDefault();
    event.stopImmediatePropagation();
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
