import { Component, Input, OnInit } from "@angular/core";
import {
  SortValues,
  StructureCommon,
  USER_FONCTION_LABELS,
  UserFonction,
  UserStructureRole,
} from "@domifa/common";
import { Subscription } from "rxjs";
import {
  StructureService,
  UserStructureWithSecurity,
} from "../../services/structure.service";
import { environment } from "../../../../../environments/environment";
import { subMonths } from "date-fns";

@Component({
  selector: "app-users",
  templateUrl: "./users.component.html",
  styleUrl: "./users.component.css",
})
export class UsersComponent implements OnInit {
  public users: UserStructureWithSecurity[] = [];
  public sortValue: SortValues = "asc";
  public currentKey = "id";
  public twoMonthsAgo = subMonths(new Date(), 2);

  public readonly frontendUrl = environment.frontendUrl;
  public readonly USER_FONCTION = UserFonction;
  public readonly _USER_FONCTION_LABELS = USER_FONCTION_LABELS;
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
        this.users = users.map((user) => {
          if (user?.lastLogin) {
            user.lastLogin = new Date(user.lastLogin);
          }
          return user;
        });
      })
    );
  }
}
