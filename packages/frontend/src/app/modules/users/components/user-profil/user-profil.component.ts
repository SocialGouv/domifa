import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { AuthService } from "src/app/services/auth.service";
import { User } from "../../interfaces/user";
import { UsersService } from "../../services/users.service";

@Component({
  selector: "app-user-profil",
  styleUrls: ["./user-profil.component.css"],
  templateUrl: "./user-profil.component.html"
})
export class UserProfilComponent implements OnInit {
  public title: string;
  public success: boolean;
  public successMessage: string;
  public error: boolean;
  public errorMessage: string;
  public users: User[];

  constructor(
    private readonly authService: AuthService,
    private readonly userService: UsersService,
    private readonly router: Router
  ) {}

  public ngOnInit() {
    this.title = "Mon compte Domifa";
    this.error = false;
    this.success = false;
    this.loadUsers();
  }

  public logout() {
    this.authService.logout();
    this.router.navigate(["/connexion"]);
  }

  public confirmUser(id: number) {
    this.userService.confirmUser(id).subscribe(
      (user: User) => {
        this.loadUsers();
        this.success = true;
      },
      error => {
        this.error = true;
      }
    );
  }

  private loadUsers() {
    this.userService.getUsers().subscribe((users: User[]) => {
      this.users = users;
    });
  }
}
