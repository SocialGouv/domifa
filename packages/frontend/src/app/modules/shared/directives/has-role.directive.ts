import {
  Directive,
  inject,
  Input,
  TemplateRef,
  ViewContainerRef,
} from "@angular/core";
import { AuthService } from "../services";

@Directive({
  standalone: true,
  selector: "[appHasRole]",
})
export class HasRoleDirective {
  private roles: string[] = [];
  private templateRef: TemplateRef<HTMLElement>;
  private viewContainer: ViewContainerRef;
  private authService: AuthService;
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
    const user = this.authService.currentUserSubject.value; // or observable snapshot
    const hasAccess = user && this.roles.includes(user.role);
    this.viewContainer.clear();

    if (hasAccess) {
      this.viewContainer.createEmbeddedView(this.templateRef);
    }
  }
}
