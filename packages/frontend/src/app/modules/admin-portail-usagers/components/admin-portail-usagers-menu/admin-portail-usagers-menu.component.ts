import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit,
} from "@angular/core";
import { AuthService } from "../../../shared/services";
import { UserStructure } from "@domifa/common";

@Component({
  selector: "app-admin-portail-usagers-menu",
  templateUrl: "./admin-portail-usagers-menu.component.html",
  styleUrls: ["./admin-portail-usagers-menu.component.css"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminPortailUsagersMenuComponent implements OnInit {
  @Input({ required: true }) public section:
    | ""
    | "parametres"
    | "informations"
    | "manage";
  @Input({ required: true }) public title!: string;

  public me!: UserStructure;

  constructor(private readonly authService: AuthService) {}

  public ngOnInit(): void {
    this.me = this.authService.currentUserValue;
  }
}
