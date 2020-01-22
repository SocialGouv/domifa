import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { ToastrService } from "ngx-toastr";
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

  public users: User[];
  public newUsers: User[];
  public modal: any;
  public selectedUser: number;

  constructor(
    public readonly authService: AuthService,
    private readonly userService: UsersService,
    private readonly router: Router,
    private modalService: NgbModal,
    private notifService: ToastrService
  ) {
    this.title = "Mon compte Domifa";
    this.users = [];
    this.newUsers = [];
    this.selectedUser = 0;
  }

  public ngOnInit() {
    this.getUsers();
  }

  public logout() {
    this.authService.logout();
    this.router.navigate(["connexion"]);
  }

  public confirmUser(id: number) {
    this.userService.confirmUser(id).subscribe(
      (user: User) => {
        this.getUsers();
        this.notifService.success(
          "Le compte de " +
            user.nom +
            " " +
            user.prenom +
            " est désormais actif"
        );
      },
      error => {
        this.notifService.error("Impossible de confirmer l'utilisateur");
      }
    );
  }

  public updateRole(id: number, role: string) {
    this.userService.updateRole(id, role).subscribe(
      (user: User) => {
        this.getUsers();
        this.notifService.success(
          "Les droits de " +
            user.nom +
            " " +
            user.prenom +
            " ont été mit à jour avec succès"
        );
      },
      error => {
        this.notifService.error(
          "Impossible de mettre à jour le rôle de l'utilisateur"
        );
      }
    );
  }

  public deleteUser() {
    this.userService.deleteUser(this.selectedUser).subscribe(
      (response: any) => {
        this.getUsers();
        this.notifService.success("Utilisateur supprimé avec succès");
      },
      error => {
        this.notifService.error("Impossible de supprimer l'utilisateur");
      }
    );
  }

  public open(content: string) {
    this.modal = this.modalService.open(content);
  }

  public hardReset() {
    this.userService.hardReset().subscribe((retour: any) => {
      this.notifService.success("Utilisateur supprimé avec succès");
    });
  }

  private getUsers() {
    if (this.authService.currentUserValue.role === "admin") {
      this.userService.getNewUsers().subscribe((users: User[]) => {
        this.newUsers = users;
      });
    }
    this.userService.getUsers().subscribe((users: User[]) => {
      this.users = users;
    });
  }
}
