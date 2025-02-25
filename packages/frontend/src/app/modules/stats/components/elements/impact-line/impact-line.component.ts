import { Component, Input } from "@angular/core";
import { fadeIn, fadeInOut } from "../../../../../shared";

@Component({
  animations: [fadeInOut, fadeIn],
  selector: "app-impact-line",
  templateUrl: "./impact-line.component.html",
  styleUrls: ["./impact-line.component.scss"],
})
export class ImpactLineComponent {
  @Input({ required: true }) public direction!: "horizontal" | "vertical";
}
