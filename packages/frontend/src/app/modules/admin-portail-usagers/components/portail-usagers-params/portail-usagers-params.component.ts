import { Component, OnDestroy, OnInit } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { UserStructure, StructureCommon } from "@domifa/common";
import { Subscription } from "rxjs";
import { CustomToastService, AuthService } from "../../../shared/services";
import { ManagePortailUsagersService } from "../../services/manage-portail-usagers.service";
import { ActivatedRoute, Router } from "@angular/router";
import { StructureCommonWeb } from "../../../structures/classes";

@Component({
  selector: "app-portail-usagers-params",
  templateUrl: "./portail-usagers-params.component.html",
  styleUrls: ["./portail-usagers-params.component.css"],
})
export class PortailUsagersParamsComponent implements OnInit, OnDestroy {
  public me!: UserStructure | null;
  public structure!: StructureCommon;

  public loading: boolean;
  private subscription = new Subscription();
  public section: "" | "parametres" | "informations" = "";

  constructor(
    private readonly managePortailUsagersService: ManagePortailUsagersService,
    private readonly toastService: CustomToastService,
    private readonly authService: AuthService,
    private readonly titleService: Title,
    private readonly route: ActivatedRoute,
    private readonly router: Router
  ) {
    this.loading = false;
    this.titleService.setTitle("Paramètres du portail Mon DomiFa");
  }

  public ngOnInit(): void {
    this.me = this.authService.currentUserValue;
    if (this.me) {
      this.structure = this.me.structure;
    }
    const section = this.route.snapshot.params?.section ?? "";

    if (section !== "" && section !== "parametres") {
      this.toastService.error("La page recherchée n'existe pas");
      this.router.navigate(["404"]);
      return;
    }
    this.section = section;
  }

  public activatePortail() {
    this.structure.portailUsager.enabledByStructure = true;
    this.structure.portailUsager.usagerLoginUpdateLastInteraction = true;
    this.submitStructurePortailForm();
  }

  public submitStructurePortailForm() {
    this.subscription.add(
      this.managePortailUsagersService
        .patchPortailUsagerParams({
          enabledByStructure: this.structure.portailUsager.enabledByStructure,
          usagerLoginUpdateLastInteraction:
            this.structure.portailUsager.usagerLoginUpdateLastInteraction,
        })
        .subscribe({
          next: (structure: StructureCommonWeb) => {
            this.loading = false;
            this.me.structure = structure;

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

  public ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
