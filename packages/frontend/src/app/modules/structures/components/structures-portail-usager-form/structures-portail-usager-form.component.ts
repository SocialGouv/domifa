import { Component, OnInit } from "@angular/core";
import { CustomToastService } from "src/app/modules/shared/services/custom-toast.service";
import { StructureCommon, UserStructure } from "../../../../../_common/model";
import { AuthService } from "../../../shared/services/auth.service";
import { StructureService } from "../../services/structure.service";

@Component({
  selector: "app-structures-portail-usager-form",
  templateUrl: "./structures-portail-usager-form.component.html",
  styleUrls: ["./structures-portail-usager-form.component.css"],
})
export class StructuresPortailUsagerFormComponent implements OnInit {
  public me: UserStructure;
  public structure: StructureCommon;

  public loading: boolean;

  constructor(
    private structureService: StructureService,
    private toastService: CustomToastService,
    private authService: AuthService
  ) {
    this.me = null;
    this.structure = null;
    this.loading = false;
  }

  public ngOnInit(): void {
    this.authService.currentUserSubject.subscribe((user: UserStructure) => {
      this.me = user;
      this.structure = user.structure;
    });
  }

  public submitStructureSmsForm() {
    this.loading = true;
    this.structureService
      .patchPortailUsagerParams({
        enabledByStructure: this.structure.portailUsager.enabledByStructure,
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
          this.toastService.error("Impossible de mettre à jour les paramètres");
        },
      });
  }
}
