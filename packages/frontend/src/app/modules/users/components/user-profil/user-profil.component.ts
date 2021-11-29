import { Component, OnInit, TemplateRef } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { ToastrService } from "ngx-toastr";

import {
  UserStructure,
  UserStructureProfile,
  UserStructureRole,
} from "../../../../../_common/model";
import { AuthService } from "../../../shared/services/auth.service";
import { UsersService } from "../../services/users.service";

@Component({
  selector: "app-user-profil",
  styleUrls: ["./user-profil.component.css"],
  templateUrl: "./user-profil.component.html",
})
export class UserProfilComponent implements OnInit {
  public users: UserStructureProfile[];
  public me: UserStructure;

  public selectedUser: number;
  public usersInfos: boolean;
  public exportLoading: boolean;

  constructor(
    private authService: AuthService,
    private userService: UsersService,
    private modalService: NgbModal,
    private notifService: ToastrService,
    private titleService: Title
  ) {
    this.users = [];

    this.selectedUser = null;
    this.usersInfos = false;
    this.exportLoading = false;
  }

  public ngOnInit(): void {
    this.titleService.setTitle("Compte Domifa");

    this.authService.currentUserSubject.subscribe((user: UserStructure) => {
      if (user !== null) {
        this.me = user;

        this.getUsers();
      }
    });
  }

  public updateRole(id: number, role: UserStructureRole) {
    this.userService.updateRole(id, role).subscribe({
      next: (user: UserStructureProfile) => {
        this.getUsers();
        this.notifService.success(
          "Les droits de " +
            user.nom +
            " " +
            user.prenom +
            " ont été mis à jour avec succès"
        );
      },
      error: () => {
        this.notifService.error(
          "Impossible de mettre à jour le rôle de l'utilisateur"
        );
      },
    });
  }

  public deleteUser() {
    this.userService.deleteUser(this.selectedUser).subscribe({
      next: () => {
        this.getUsers();
        this.modalService.dismissAll();
        this.notifService.success("Utilisateur supprimé avec succès");
      },
      error: () => {
        this.notifService.error("Impossible de supprimer l'utilisateur");
      },
    });
  }

  public open(content: TemplateRef<any>) {
    this.modalService.open(content);
  }

  public closeModal() {
    this.modalService.dismissAll();
  }

  private getUsers() {
    this.userService.getUsers().subscribe((users: UserStructureProfile[]) => {
      this.users = users;
    });
  }
}
