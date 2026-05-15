import { Component, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { Store } from "@ngrx/store";
import { Subscription } from "rxjs";

import {
  CURRENT_TOOL_OPTIONS,
  MARKET_TOOLS_OPTIONS,
  MOTIFS_REFUS_STRUCTURE_LABELS,
  MOTIFS_SUPPRESSION_STRUCTURE_LABELS,
  SOURCES_OPTIONS,
  Structure,
  StructureAdmin,
  STRUCTURE_ORGANISME_TYPE_LABELS,
  STRUCTURE_TYPE_LABELS,
} from "@domifa/common";

import { selectStructureById } from "../../../shared/store/structures";
import { DsfrModalComponent } from "@edugouvfr/ngx-dsfr";
import {
  AdminStructuresApiClient,
  CustomToastService,
} from "../../../shared/services";

@Component({
  selector: "app-structure-info",
  templateUrl: "./structure-info.component.html",
  styleUrl: "./structure-info.component.css",
})
export class StructureInfoComponent implements OnInit, OnDestroy {
  public structure?: Structure;
  public cachedStructure?: StructureAdmin;
  public readonly STRUCTURE_TYPE_LABELS = STRUCTURE_TYPE_LABELS;
  public readonly STRUCTURE_ORGANISME_TYPE_LABELS =
    STRUCTURE_ORGANISME_TYPE_LABELS;
  public readonly MOTIFS_SUPPRESSION_STRUCTURE_LABELS =
    MOTIFS_SUPPRESSION_STRUCTURE_LABELS;
  public readonly MOTIFS_REFUS_STRUCTURE_LABELS = MOTIFS_REFUS_STRUCTURE_LABELS;
  public smsDays = "";
  public sourceLabel = "";
  public currentToolLabel = "";
  public marketToolLabel = "";
  public structureToDelete?: StructureAdmin;
  public structureToRefuse?: StructureAdmin;
  public currentStructure?: StructureAdmin;

  @ViewChild("addUserModal")
  public addUserModal!: DsfrModalComponent;

  private readonly subscription = new Subscription();

  constructor(
    private readonly route: ActivatedRoute,
    private readonly store: Store,
    private readonly adminStructuresApiClient: AdminStructuresApiClient,
    private readonly toastService: CustomToastService
  ) {}

  ngOnInit() {
    const structureId = parseInt(
      this.route.parent?.snapshot.params["structureId"],
      10
    );

    this.subscription.add(
      this.store.select(selectStructureById(structureId)).subscribe({
        next: (structure) => {
          if (!structure) return;
          this.structure = structure as unknown as Structure;
          this.cachedStructure = structure;
          this.smsDays = this.getSelectedDaysForSms();
          this.initializeLabels();
        },
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  getSelectedDaysForSms(): string {
    if (!this.structure?.sms?.schedule) return "Aucun jour sélectionné";

    const daysInFrench: Record<string, string> = {
      monday: "Lundi",
      tuesday: "Mardi",
      wednesday: "Mercredi",
      thursday: "Jeudi",
      friday: "Vendredi",
    };

    const selectedDays = Object.entries(this.structure.sms.schedule)
      .filter(([, value]) => value === true)
      .map(([key]) => daysInFrench[key]);

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

  public cancelForm(): void {
    this.structureToDelete = undefined;
    this.structureToRefuse = undefined;
    this.currentStructure = undefined;
    this.addUserModal?.close();
  }

  public refuseModal(structure: StructureAdmin): void {
    this.structureToRefuse = structure;
  }

  public confirmStructure(structure: StructureAdmin): void {
    this.subscription.add(
      this.adminStructuresApiClient
        .setDecisionStructure(structure.id, "VALIDE")
        .subscribe({
          next: () => {
            this.toastService.success("Structure vérifiée avec succès");
          },
          error: () => {
            this.toastService.error("Impossible de valider la structure");
          },
        })
    );
  }

  public openAddAdminModal(structure: StructureAdmin): void {
    this.currentStructure = structure;
    this.addUserModal.open();
  }
}
