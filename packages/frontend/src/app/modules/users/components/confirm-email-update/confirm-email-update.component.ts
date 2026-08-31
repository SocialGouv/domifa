import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { Title } from "@angular/platform-browser";
import { Subscription } from "rxjs";

import { UsersService } from "../../services/users.service";
import { AuthService } from "../../../shared/services/auth.service";

@Component({
  selector: "app-confirm-email-update",
  templateUrl: "./confirm-email-update.component.html",
  standalone: false,
})
export class ConfirmEmailUpdateComponent implements OnInit {
  public loading = true;
  public success = false;

  private readonly subscription = new Subscription();

  constructor(
    private readonly route: ActivatedRoute,
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
    private readonly titleService: Title
  ) {}

  public ngOnInit(): void {
    this.titleService.setTitle("Confirmation de votre nouvelle adresse email");

    const { uuid, token } = this.route.snapshot.params;

    this.subscription.add(
      this.usersService.confirmEmailUpdate({ uuid, token }).subscribe({
        next: () => {
          this.loading = false;
          this.success = true;

          // Le backend a déjà révoqué la session serveur (terminateUserSession).
          // On aligne l'état client dessus seulement maintenant, une fois le
          // message de succès affiché : le nettoyer plus tôt (avant la
          // réponse) ferait clignoter le header vers l'état déconnecté sous
          // les yeux de la personne pendant le chargement. Le faire ici évite
          // aussi qu'un appel authentifié ultérieur (ex. clic sur un lien du
          // menu) échoue en 401 avec un message trompeur ("session expirée")
          // sur un navigateur qui affiche encore le header connecté.
          this.authService.clearSessionSilently();
        },
        error: () => {
          this.loading = false;
          this.success = false;
        },
      })
    );
  }
}
