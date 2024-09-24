import { ChangeDetectionStrategy, Component, Input } from "@angular/core";
import { UserStructure } from "@domifa/common";

@Component({
  selector: "app-admin-portail-usagers-menu",
  templateUrl: "./admin-portail-usagers-menu.component.html",
  styleUrls: ["./admin-portail-usagers-menu.component.css"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminPortailUsagersMenuComponent {
  @Input() public section: "" | "parametres" | "informations";
  @Input() public me!: UserStructure;
}
