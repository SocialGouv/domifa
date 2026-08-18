import { CommonModule, Location } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { AuthService } from "../../../shared/services/auth.service";

// Cross-origin handoff target for admin support-mode activation
// (portail-admins opens this URL with ?token=<access_token>). Seeds a
// session from the token, then strips it from the URL/history — it's a
// bearer credential and shouldn't linger in browser history or be re-shared
// via a copied link.
@Component({
  selector: "app-support-entry",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./support-entry.component.html",
})
export class SupportEntryComponent implements OnInit {
  public error = false;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly authService: AuthService,
    private readonly location: Location
  ) {}

  public ngOnInit(): void {
    const token = this.route.snapshot.queryParamMap.get("token");
    if (!token) {
      this.error = true;
      return;
    }

    try {
      this.authService.loginWithToken(token);
      this.location.replaceState("/support-entry");
      this.router.navigateByUrl("/manage", { replaceUrl: true });
    } catch {
      this.error = true;
    }
  }
}
