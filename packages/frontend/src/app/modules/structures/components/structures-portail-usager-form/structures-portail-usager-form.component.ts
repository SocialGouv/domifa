import { Component, OnDestroy, OnInit } from "@angular/core";
import { Subscription } from "rxjs";

import { CustomToastService } from "src/app/modules/shared/services/custom-toast.service";
import { StructureCommon, UserStructure } from "../../../../../_common/model";
import { AuthService } from "../../../shared/services/auth.service";
import { StructureService } from "../../services/structure.service";

@Component({
  selector: "app-structures-portail-usager-form",
  templateUrl: "./structures-portail-usager-form.component.html",
  styleUrls: ["./structures-portail-usager-form.component.css"],
})
export class StructuresPortailUsagerFormComponent implements OnInit, OnDestroy {
  public me!: UserStructure | null;
  public structure!: StructureCommon;

  public loading: boolean;
  private subscription = new Subscription();

  constructor(
    private readonly structureService: StructureService,
    private readonly toastService: CustomToastService,
    private readonly authService: AuthService
  ) {
    this.loading = false;
  }

  public ngOnInit(): void {
    this.me = this.authService.currentUserValue;
    if (this.me) {
      this.structure = this.me.structure;
    }
  }

  public submitStructureSmsForm() {
    this.loading = true;
    if (this.structure.portailUsager.enabledByStructure === false) {
      this.structure.portailUsager.usagerLoginUpdateLastInteraction = false;
    }

    this.subscription.add(
      this.structureService
        .patchPortailUsagerParams({
          enabledByStructure: this.structure.portailUsager.enabledByStructure,
          usagerLoginUpdateLastInteraction:
            this.structure.portailUsager.usagerLoginUpdateLastInteraction,
        })
        .subscribe({
          next: () => {
            this.loading = false;
            this.toastService.success(
              "Paramètres du portail usager mis à jour avec succès"
            );
          },
          error: () => {
            this.loading = false;
            this.toastService.error(
              "Impossible de mettre à jour les paramètres"
            );
          },
        })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}