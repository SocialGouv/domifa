import {
  Component,
  Input,
  OnDestroy,
  OnInit,
  AfterViewInit,
} from "@angular/core";

import { Subscription } from "rxjs";
import { environment } from "../../../../../environments/environment";

import { AuthService } from "../../../shared/services/auth.service";
import { WelcomeService } from "../../services/welcome.service";
import { UserStructure } from "@domifa/common";
import { MatomoTracker } from "ngx-matomo-client";
@Component({
  selector: "app-navbar",
  templateUrl: "./navbar.component.html",
  styleUrls: ["./navbar.component.css"],
})
export class NavbarComponent implements OnInit, OnDestroy, AfterViewInit {
  public matomoInfo: boolean;

  public readonly portailAdminUrl = environment.portailAdminUrl;

  public pendingNews = false;
  @Input() public me!: UserStructure | null;

  private readonly subscription = new Subscription();

  constructor(
    private readonly authService: AuthService,
    private readonly welcomeService: WelcomeService,
    public readonly matomoService: MatomoTracker
  ) {}

  public ngOnInit(): void {
    this.subscription.add(
      this.welcomeService.pendingNews$.subscribe({
        next: (pending) => {
          this.pendingNews = pending;
        },
      })
    );
  }

  public ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  public initMatomo(): void {
    const matomo = localStorage.getItem("matomo");
    this.matomoInfo = matomo === "done";
  }

  public closeMatomo(): void {
    this.matomoInfo = true;
    localStorage.setItem("matomo", "done");
  }
  public logout(): void {
    this.authService.logoutFromBackend();
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
