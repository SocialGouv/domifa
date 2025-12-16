import {
  Directive,
  inject,
  Input,
  OnDestroy,
  TemplateRef,
  ViewContainerRef,
} from "@angular/core";
import { AuthService } from "../services";
import { Subscription } from "rxjs";

@Directive({
  standalone: true,
  selector: "[appHasRole]",
})
export class HasRoleDirective implements OnDestroy {
  private roles: string[] = [];
  private templateRef: TemplateRef<HTMLElement>;
  private viewContainer: ViewContainerRef;
  private authService: AuthService;
  private subscription: Subscription | null = null;
  constructor() {
    this.templateRef = inject(TemplateRef);
    this.viewContainer = inject(ViewContainerRef);
    this.authService = inject(AuthService);
  }

  @Input()
  set appHasRole(roles: string[] | string) {
    this.roles = Array.isArray(roles) ? roles : [roles];
    this.updateView();
  }

  private updateView(): void {
    this.subscription = this.authService.currentUserSubject.subscribe(
      (user) => {
        const hasAccess = user && this.roles.includes(user.role);
        this.viewContainer.clear();
        if (hasAccess) {
          this.viewContainer.createEmbeddedView(this.templateRef);
        }
      }
    );
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }
}
