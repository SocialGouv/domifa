import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { AuthService } from "src/app/services/auth.service";

@Component({
  selector: "app-user-profil",
  styleUrls: ["./user-profil.component.css"],
  templateUrl: "./user-profil.component.html"
})
export class UserProfilComponent implements OnInit {
  public title: string;

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router
  ) {}

  public ngOnInit() {
    this.title = "Mon compte Domifa";
  }

  public logout() {
    this.authService.logout();
    this.router.navigate(["/connexion"]);
  }
}
