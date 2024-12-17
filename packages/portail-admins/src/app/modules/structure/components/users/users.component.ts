import { Component, Input, OnInit } from "@angular/core";
import { SortValues, StructureCommon, UserStructureRole } from "@domifa/common";
import { Subscription } from "rxjs";
import {
  StructureService,
  UserStructureWithSecurity,
} from "../../services/structure.service";

@Component({
  selector: "app-users",
  templateUrl: "./users.component.html",
  styleUrl: "./users.component.css",
})
export class UsersComponent implements OnInit {
  public users: UserStructureWithSecurity[] = [];
  public sortValue: SortValues = "asc";
  public currentKey = "id";

  public readonly USER_ROLES_LABELS: { [key in UserStructureRole]: string } = {
    admin: "Administrateur",
    responsable: "Gestionnaire",
    simple: "Instructeur",
    facteur: "Facteur",
  };

  @Input({ required: true }) public structure: StructureCommon;
  private subscription = new Subscription();
  public searching = true;

  constructor(private readonly structureService: StructureService) {}

  ngOnInit(): void {
    this.subscription.add(
      this.structureService.getUsers(this.structure.id).subscribe((users) => {
        this.users = users;
      })
    );
  }
}
