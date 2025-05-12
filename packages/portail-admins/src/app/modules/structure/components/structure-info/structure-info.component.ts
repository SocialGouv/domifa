/* eslint-disable @typescript-eslint/no-unused-vars */
import { AfterViewInit, Component, Input } from "@angular/core";
import {
  STRUCTURE_ORGANISME_TYPE_LABELS,
  STRUCTURE_TYPE_LABELS,
  StructureCommon,
} from "@domifa/common";

@Component({
  selector: "app-structure-info",
  templateUrl: "./structure-info.component.html",
  styleUrl: "./structure-info.component.css",
})
export class StructureInfoComponent implements AfterViewInit {
  @Input({ required: true }) public structure: StructureCommon;
  public readonly STRUCTURE_TYPE_LABELS = STRUCTURE_TYPE_LABELS;
  public readonly STRUCTURE_ORGANISME_TYPE_LABELS =
    STRUCTURE_ORGANISME_TYPE_LABELS;
  public smsDays = "";

  ngAfterViewInit() {
    this.smsDays = this.getSelectedDaysForSms();
  }

  getSelectedDaysForSms(): string {
    if (!this.structure.sms.schedule) return "Aucun jour sélectionné";

    const daysInFrench = {
      monday: "Lundi",
      tuesday: "Mardi",
      wednesday: "Mercredi",
      thursday: "Jeudi",
      friday: "Vendredi",
    };

    const selectedDays = Object.entries(this.structure.sms.schedule)
      .filter(([_, value]) => value === true)
      .map(([key, _]) => daysInFrench[key]);

    return selectedDays.length > 0
      ? selectedDays.join(", ")
      : "Aucun jour sélectionné";
  }
}
