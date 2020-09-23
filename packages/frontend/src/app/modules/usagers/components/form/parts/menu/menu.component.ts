import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";

import { Usager } from "src/app/modules/usagers/interfaces/usager";
import { UsagerService } from "src/app/modules/usagers/services/usager.service";

import { User } from "src/app/modules/users/interfaces/user";
import { AuthService } from "src/app/modules/shared/services/auth.service";
import { Router } from "@angular/router";
import { ToastrService } from "ngx-toastr";

@Component({
  providers: [UsagerService],
  selector: "app-form-menu",
  styleUrls: ["./menu.component.css"],
  templateUrl: "./menu.component.html",
})
export class MenuComponent implements OnInit {
  @Input() public usager!: Usager;

  @Input() public currentStep!: number;

  public etapes = [
    "État civil",
    "Prise de RDV",
    "Entretien",
    "Pièces justificatives",
    "Décision finale",
  ];

  public etapesUrl = [
    "etat-civil",
    "rendez-vous",
    "entretien",
    "documents",
    "decision",
  ];
  public me: User;

  constructor(
    public authService: AuthService,
    private router: Router,
    private notifService: ToastrService
  ) {
    this.authService.currentUser.subscribe((user: User) => {
      this.me = user;
    });
  }

  public ngOnInit() {}

  public goToStep(step: number) {
    if (this.usager.id === 0) {
      this.notifService.warning(
        "Vous devez remplir la première étape avant de passer à la suite"
      );
    } else if (step > this.usager.etapeDemande) {
      this.notifService.warning(
        "Pour passer à la suite, vous devez cliquer sur Suivant"
      );
    } else {
      this.router.navigate([
        "usager/" + this.usager.id + "/edit/" + this.etapesUrl[step],
      ]);
    }
  }
}
