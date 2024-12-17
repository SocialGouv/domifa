import { Component } from "@angular/core";
import { SortValues, UserStructure, UserStructureRole } from "@domifa/common";

@Component({
  selector: "app-users",
  templateUrl: "./users.component.html",
  styleUrl: "./users.component.css",
})
export class UsersComponent {
  public users: UserStructure[] = [];
  public sortValue: SortValues = "asc";
  public currentKey = "id";

  public readonly USER_ROLES_LABELS: { [key in UserStructureRole]: string } = {
    admin: "Administrateur",
    responsable: "Gestionnaire",
    simple: "Instructeur",
    facteur: "Facteur",
  };
}
