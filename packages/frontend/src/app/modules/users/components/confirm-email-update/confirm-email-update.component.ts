import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { Title } from "@angular/platform-browser";
import { Subscription } from "rxjs";

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
    private readonly titleService: Title
  ) {}

  public ngOnInit(): void {
    this.titleService.setTitle("Confirmation de votre nouvelle adresse email");

    // Le backend révoque déjà la session serveur (terminateUserSession) en
    // cas de succès : si quelqu'un était connecté sur ce navigateur, son
    // prochain appel API échouera en 401 et sera géré normalement par
    // l'intercepteur global. On ne déconnecte pas nous-mêmes ici pour éviter
    // de faire disparaître cette page sous les yeux de la personne qui la lit.
    const { uuid, token } = this.route.snapshot.params;

    this.subscription.add(
      this.usersService.confirmEmailUpdate({ uuid, token }).subscribe({
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
