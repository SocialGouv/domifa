import { Component, OnInit, TemplateRef } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { ToastrService } from "ngx-toastr";
import { StructureService } from "src/app/modules/structures/services/structure.service";
import { Structure } from "src/app/modules/structures/structure.interface";
import { AuthService } from "src/app/modules/shared/services/auth.service";
import { ERROR_LABELS } from "src/app/shared/errors.labels";
import { User } from "../../interfaces/user";
import { UsersService } from "../../services/users.service";

@Component({
  selector: "app-user-profil",
  styleUrls: ["./user-profil.component.css"],
  templateUrl: "./user-profil.component.html",
})
export class UserProfilComponent implements OnInit {
  public title: string;

  public users: User[];
  public structure: Structure;
  public newUsers: User[];
  public modal: any;
  public selectedUser: number;
  public showHardReset: boolean;
  public hardResetCode: boolean;
  public hardResetForm: FormGroup;
  public errorLabels: any;

  constructor(
    public readonly authService: AuthService,
    private readonly userService: UsersService,
    private readonly structureService: StructureService,
    private readonly router: Router,
    private modalService: NgbModal,
    private notifService: ToastrService,
    private formBuilder: FormBuilder
  ) {
    this.title = "Mon compte Domifa";
    this.users = [];
    this.newUsers = [];
    this.selectedUser = 0;
    this.showHardReset = false;
    this.hardResetCode = null;
    this.errorLabels = ERROR_LABELS;
  }

  get f() {
    return this.hardResetForm.controls;
  }

  public ngOnInit() {
    this.getUsers();

    this.structureService
      .findMyStructure()
      .subscribe((structure: Structure) => {
        this.structure = structure;
      });

    this.hardResetForm = this.formBuilder.group({
      token: ["", [Validators.required]],
    });
  }

  public logout() {
    this.authService.logout();
    this.router.navigate(["/connexion"]);
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
      (error) => {
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
      (error) => {
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
        this.modalService.dismissAll();
        this.notifService.success("Utilisateur supprimé avec succès");
      },
      (error) => {
        this.notifService.error("Impossible de supprimer l'utilisateur");
      }
    );
  }

  public open(content: TemplateRef<any>) {
    this.modal = this.modalService.open(content);
  }

  public hardReset() {
    this.structureService.hardReset().subscribe((retour: any) => {
      this.showHardReset = true;
    });
  }

  public hardResetConfirm() {
    if (this.hardResetForm.invalid) {
      this.notifService.error("Veuillez vérifier le formulaire");
      return;
    }

    this.structureService
      .hardResetConfirm(this.hardResetForm.controls.token.value)
      .subscribe(
        (retour: any) => {
          this.notifService.success(
            "La remise à zéro a été effectuée avec succès !"
          );
          this.modalService.dismissAll();
          this.showHardReset = false;
        },
        (error: any) => {
          const message = this.errorLabels[error.error.message];
          this.notifService.error(message);
        }
      );
  }

  public sendMail() {
    this.userService.tipi().subscribe((variable: any) => {
      alert("Envoi du mail réussi");
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
