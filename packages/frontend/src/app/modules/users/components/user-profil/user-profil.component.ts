import { Component, OnInit, TemplateRef } from "@angular/core";
import { FormBuilder } from "@angular/forms";
import { Router } from "@angular/router";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { ToastrService } from "ngx-toastr";
import { StructureService } from "src/app/modules/structures/services/structure.service";
import { Structure } from "src/app/modules/structures/structure.interface";
import { AuthService } from "src/app/modules/shared/services/auth.service";
import { User } from "../../interfaces/user";
import { UsersService } from "../../services/users.service";

import { Title } from "@angular/platform-browser";

@Component({
  selector: "app-user-profil",
  styleUrls: ["./user-profil.component.css"],
  templateUrl: "./user-profil.component.html",
})
export class UserProfilComponent implements OnInit {
  public users: User[];
  public me: User;
  public structure: Structure;
  public newUsers: User[];
  public modal: any;
  public selectedUser: number;
  public usersInfos: boolean;
  public exportLoading: boolean;
  public errorLabels: any;

  constructor(
    public readonly authService: AuthService,
    private readonly userService: UsersService,
    private readonly structureService: StructureService,
    private readonly router: Router,
    private modalService: NgbModal,
    private notifService: ToastrService,
    private formBuilder: FormBuilder,
    private titleService: Title
  ) {
    this.users = [];
    this.newUsers = [];
    this.selectedUser = 0;
    this.usersInfos = false;
    this.exportLoading = false;
  }

  public ngOnInit() {
    this.titleService.setTitle("Mon compte Domifa");

    this.getUsers();

    this.structureService
      .findMyStructure()
      .subscribe((structure: Structure) => {
        this.structure = structure;
      });

    this.authService.currentUser.subscribe((user) => {
      this.me = user;
    });
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
      () => {
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
            " ont été mis à jour avec succès"
        );
      },
      () => {
        this.notifService.error(
          "Impossible de mettre à jour le rôle de l'utilisateur"
        );
      }
    );
  }

  public deleteUser() {
    this.userService.deleteUser(this.selectedUser).subscribe(
      () => {
        this.getUsers();
        this.modalService.dismissAll();
        this.notifService.success("Utilisateur supprimé avec succès");
      },
      () => {
        this.notifService.error("Impossible de supprimer l'utilisateur");
      }
    );
  }

  public open(content: TemplateRef<any>) {
    this.modal = this.modalService.open(content);
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
