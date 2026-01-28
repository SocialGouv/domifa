import { AfterViewInit, Component, Input } from "@angular/core";

import { MatomoTracker } from "ngx-matomo-client";
import { environment } from "../../../../../environments/environment";

import { AuthService } from "../../../shared/services/auth.service";
import { UserStructure } from "@domifa/common";
import { Router } from "@angular/router";
@Component({
  selector: "app-navbar",
  templateUrl: "./navbar.component.html",
  styleUrls: ["./navbar.component.css"],
})
export class NavbarComponent implements AfterViewInit {
  public readonly portailAdminUrl = environment.portailAdminUrl;

  @Input() public pendingNews!: boolean;
  @Input() public me!: UserStructure | null;

  constructor(
    private readonly authService: AuthService,
    public readonly matomoService: MatomoTracker,
    private router: Router
  ) {}

  public logout(): void {
    this.authService.logoutFromBackend();
  }

  isCurrentRoute(path: string): boolean {
    return this.router.url === path;
  }

  ngAfterViewInit(): void {
    // Démarrer le dsfr en mode angular pour éviter la recopie des liens qui ne fonctionnent pas en SPA
    // https://www.systeme-de-design.gouv.fr/version-courante/fr/composants/en-tete/code-de-l-en-tete#variante-avec-raccourcis-dupliques-pour-angular-react-et-vue
    if (
      window &&
      window["dsfr"] &&
      typeof window["dsfr"].start === "function"
    ) {
      window["dsfr"].start();
    }
  }
}
