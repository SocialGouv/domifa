import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { UserIdleService } from "angular-user-idle";
import { MatomoTracker } from "ngx-matomo";
import { environment } from "../../../../../environments/environment";
import { UserStructure } from "../../../../../_common/model";
import { AuthService } from "../../../shared/services/auth.service";

@Component({
  selector: "app-navbar",
  templateUrl: "./navbar.component.html",
  styleUrls: ["./navbar.component.css"],
})
export class NavbarComponent implements OnInit {
  public isNavbarCollapsed: boolean;
  public me: UserStructure;
  public matomoInfo: boolean;

  public portailAdminUrl = environment.portailAdminUrl;

  constructor(
    private authService: AuthService,
    private router: Router,
    public matomoService: MatomoTracker,
    private userIdleService: UserIdleService
  ) {
    this.isNavbarCollapsed = false;
    this.me = null;
  }

  public ngOnInit(): void {
    this.authService.currentUserSubject.subscribe((user: UserStructure) => {
      this.me = user;
    });

    // Affichage de matomo
    this.initMatomo();

    // Lancement de la surveillance d'inactivité
    this.userIdleService.startWatching();

    // Lancement du décompte
    this.userIdleService.onTimerStart().subscribe({
      next: () => {
        console.log("Déconnexion dans quelques instants...");
      },
    });

    // Délai d'inactivité atteint, on déconnecte
    this.userIdleService.onTimeout().subscribe({
      next: () => {
        if (this.authService.currentUserSubject.value !== null) {
          this.authService.logout();
        }
      },
    });
  }

  public initMatomo(): void {
    const matomo = localStorage.getItem("matomo");
    this.matomoInfo = matomo === "done";
    this.matomoService.setUserId("0");
  }

  public closeMatomo(): void {
    this.matomoInfo = true;
    localStorage.setItem("matomo", "done");
  }

  public logout(): void {
    this.authService.logout();
    this.router.navigate(["/connexion"]);
  }
}
