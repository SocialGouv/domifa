/* eslint-disable @typescript-eslint/no-unused-vars */
import { AfterViewInit, Component, Input } from "@angular/core";
import {
  CURRENT_TOOL_OPTIONS,
  MARKET_TOOLS_OPTIONS,
  SOURCES_OPTIONS,
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
  public sourceLabel: string = "";
  public currentToolLabel: string = "";
  public marketToolLabel: string = "";

  ngAfterViewInit() {
    this.smsDays = this.getSelectedDaysForSms();
    this.initializeLabels();
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

  private initializeLabels(): void {
    if (!this.structure?.registrationData?.source) {
      this.sourceLabel = "Non renseigné";
    } else {
      const sourceOption = SOURCES_OPTIONS.find(
        (opt) => opt.value === this.structure.registrationData.source
      );

      if (sourceOption) {
        if (
          sourceOption.requiresDetail &&
          this.structure.registrationData.sourceDetail
        ) {
          this.sourceLabel = `${sourceOption.label} (${this.structure.registrationData.sourceDetail})`;
        } else {
          this.sourceLabel = sourceOption.label;
        }
      } else {
        this.sourceLabel = this.structure.registrationData.source;
      }
    }

    if (!this.structure?.registrationData?.currentTool) {
      this.currentToolLabel = "Non renseigné";
    } else {
      // Current tool label
      const currentToolOption = CURRENT_TOOL_OPTIONS.find(
        (opt) => opt.value === this.structure.registrationData.currentTool
      );
      this.currentToolLabel = currentToolOption
        ? currentToolOption.label
        : this.structure.registrationData.currentTool;
    }

    if (!this.structure?.registrationData?.marketTool) {
      this.marketToolLabel = "Non renseigné";
    } else {
      // Market tool label avec détail si "autre"

      const marketToolOption = MARKET_TOOLS_OPTIONS.find(
        (opt) => opt.value === this.structure.registrationData.marketTool
      );
      if (marketToolOption) {
        if (
          this.structure.registrationData.marketTool === "AUTRE" &&
          this.structure.registrationData.marketToolOther
        ) {
          this.marketToolLabel = `${marketToolOption.label} (${this.structure.registrationData.marketToolOther})`;
        } else {
          this.marketToolLabel = marketToolOption.label;
        }
      } else {
        this.marketToolLabel = this.structure.registrationData.marketTool;
      }
    }
  }
}
