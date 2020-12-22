import { Component, OnInit, TemplateRef } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { ToastrService } from "ngx-toastr";
import { AuthService } from "src/app/modules/shared/services/auth.service";
import { StructureService } from "src/app/modules/structures/services/structure.service";
import { Structure } from "src/app/modules/structures/structure.interface";
import { AppUser, UserProfile, UserRole } from "../../../../../_common/model";
import { UsersService } from "../../services/users.service";

@Component({
  selector: "app-user-profil",
  styleUrls: ["./user-profil.component.css"],
  templateUrl: "./user-profil.component.html",
})
export class UserProfilComponent implements OnInit {
  public users: UserProfile[];
  public me: AppUser;
  public structure: Structure;
  public newUsers: UserProfile[];
  public modal: any;
  public selectedUser: number;
  public usersInfos: boolean;
  public exportLoading: boolean;
  public errorLabels: any;

  constructor(
    public authService: AuthService,
    private userService: UsersService,
    private structureService: StructureService,
    private modalService: NgbModal,
    private notifService: ToastrService,
    private titleService: Title
  ) {
    this.users = [];
    this.newUsers = [];
    this.selectedUser = 0;
    this.usersInfos = false;
    this.exportLoading = false;
  }

  public ngOnInit() {
    this.titleService.setTitle("Compte Domifa");

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
      (user: UserProfile) => {
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

  public updateRole(id: number, role: UserRole) {
    this.userService.updateRole(id, role).subscribe(
      (user: UserProfile) => {
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
      this.userService.getNewUsers().subscribe((users: UserProfile[]) => {
        this.newUsers = users;
      });
    }
    this.userService.getUsers().subscribe((users: UserProfile[]) => {
      this.users = users;
    });
  }
}
