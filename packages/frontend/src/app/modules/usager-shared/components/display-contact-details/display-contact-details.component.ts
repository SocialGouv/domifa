import { Component, Input } from "@angular/core";
import { UserStructure } from "@domifa/common";
import { UsagerFormModel } from "../../interfaces";

@Component({
  selector: "app-display-contact-details",
  templateUrl: "./display-contact-details.component.html",
  styleUrls: ["./display-contact-details.component.css"],
})
export class DisplayContactDetailsComponent {
  @Input({ required: true }) public usager!: UsagerFormModel;
  @Input({ required: true }) public me!: UserStructure | null;
}
