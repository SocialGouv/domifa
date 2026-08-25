import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { Title } from "@angular/platform-browser";
import { Subscription } from "rxjs";

import { AuthService } from "../../../shared/services/auth.service";
import { UsersService } from "../../services/users.service";

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

    // Poste partagé : si quelqu'un d'autre est connecté sur ce navigateur,
    // on le déconnecte silencieusement avant d'appliquer le changement —
    // pas de toast/redirection, cette page affiche son propre état.
    this.authService.clearSessionSilently();

    const { userId, token } = this.route.snapshot.params;

    this.subscription.add(
      this.usersService.confirmEmailUpdate({ userId, token }).subscribe({
        next: () => {
          this.loading = false;
          this.success = true;
        },
        error: () => {
          this.loading = false;
          this.success = false;
        },
      })
    );
  }
}
