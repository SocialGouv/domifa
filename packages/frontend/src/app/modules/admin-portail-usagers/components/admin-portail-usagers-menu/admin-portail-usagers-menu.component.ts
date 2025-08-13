import { ChangeDetectionStrategy, Component, Input } from "@angular/core";

@Component({
  selector: "app-admin-portail-usagers-menu",
  templateUrl: "./admin-portail-usagers-menu.component.html",
  styleUrls: ["./admin-portail-usagers-menu.component.css"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminPortailUsagersMenuComponent {
  @Input({ required: true }) public section:
    | ""
    | "parametres"
    | "informations"
    | "manage";
  @Input({ required: true }) public title!: string;
}
