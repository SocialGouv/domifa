import { Component, OnInit } from "@angular/core";
import {
  STRUCTURE_INFORMATION_TYPES,
  StructureInformation,
} from "@domifa/common";
import { Subscription } from "rxjs";
import { StructureInformationService } from "../../services/structure-information.service";
import { addDays, isAfter } from "date-fns";

@Component({
  selector: "app-structure-information",
  templateUrl: "./structure-information.component.html",
  styleUrls: ["./structure-information.component.css"],
})
export class StructureInformationComponent implements OnInit {
  public readonly STRUCTURE_INFORMATION_TYPES = STRUCTURE_INFORMATION_TYPES;
  private subscription = new Subscription();
  public structureInformation: StructureInformation[] = [];

  constructor(
    private readonly structureInformationService: StructureInformationService,
  ) {}

  ngOnInit(): void {
    this.getStructureInformation();
  }

  public getStructureInformation() {
    this.subscription.add(
      this.structureInformationService.getAllStructureInformation().subscribe({
        next: (structureInformation: StructureInformation[]) => {
          const today = new Date();
          const futureDate = addDays(today, 15);

          this.structureInformation = structureInformation.filter((info) => {
            if (!info.isTemporary) {
              return true;
            }
            if (info.endDate) {
              return isAfter(new Date(info.endDate), futureDate);
            }
            return false;
          });
        },
      }),
    );
  }
}
