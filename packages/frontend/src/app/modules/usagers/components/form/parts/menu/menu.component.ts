import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";

import { Usager } from "src/app/modules/usagers/interfaces/usager";
import { UsagerService } from "src/app/modules/usagers/services/usager.service";

import { User } from "src/app/modules/users/interfaces/user";
import { AuthService } from "src/app/modules/shared/services/auth.service";
import { Router } from "@angular/router";

@Component({
  providers: [UsagerService],
  selector: "app-form-menu",
  styleUrls: ["./menu.component.css"],
  templateUrl: "./menu.component.html",
})
export class MenuComponent implements OnInit {
  @Input() public usager!: Usager;
  @Output() public usagerChange = new EventEmitter<Usager>();

  @Input() public editRdv!: boolean;
  @Output() public editRdvChange = new EventEmitter<boolean>();

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

  constructor(public authService: AuthService, private router: Router) {
    this.authService.currentUser.subscribe((user: User) => {
      this.me = user;
    });
  }

  public ngOnInit() {}

  public goToStep(step: number) {
    this.router.navigate([
      "usager/" + this.usager.id + "/edit/" + this.etapesUrl[step],
    ]);
  }
}
