import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { MatomoTracker } from "ngx-matomo";
import { AppUser } from "../../../../../_common/model";
import { AuthService } from "../../../shared/services/auth.service";

@Component({
  selector: "app-navbar",
  templateUrl: "./navbar.component.html",
  styleUrls: ["./navbar.component.css"],
})
export class NavbarComponent implements OnInit {
  public isNavbarCollapsed: boolean;
  public me: AppUser;

  constructor(
    private authService: AuthService,
    private router: Router,
    public matomo: MatomoTracker
  ) {
    this.isNavbarCollapsed = false;
    this.me = null;
  }

  public ngOnInit(): void {
    this.authService.currentUserSubject.subscribe((user: AppUser) => {
      this.me = user;
    });
  }

  public logout(): void {
    this.authService.logout();
    this.router.navigate(["/connexion"]);
  }
}
