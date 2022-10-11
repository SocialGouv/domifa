import { Component, OnInit } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { ActivatedRoute, Router } from "@angular/router";
import { CustomToastService } from "src/app/modules/shared/services/custom-toast.service";
import {
  UsagerLight,
  UserStructure,
  UserStructureRole,
} from "../../../../../_common/model";
import { getUsagerNomComplet } from "../../../../shared/getUsagerNomComplet";
import { AuthService } from "../../../shared/services/auth.service";
import { UsagerFormModel } from "../../../usager-shared/interfaces/UsagerFormModel";

import { UsagerService } from "../../../usagers/services/usager.service";

@Component({
  selector: "app-profil-dossier",
  templateUrl: "./profil-dossier.component.html",
  styleUrls: ["./profil-dossier.component.css"],
})
export class ProfilDossierComponent implements OnInit {
  public me!: UserStructure | null;
  public usager!: UsagerFormModel;

  public editInfos: boolean;
  public editEntretien: boolean;

  constructor(
    private readonly authService: AuthService,
    private readonly usagerService: UsagerService,
    private readonly titleService: Title,
    private readonly toastService: CustomToastService,
    private readonly route: ActivatedRoute,
    private readonly router: Router
  ) {
    this.editInfos = false;
    this.editEntretien = false;
  }

  public ngOnInit(): void {
    this.me = this.authService.currentUserValue;

    this.usagerService.findOne(this.route.snapshot.params.id).subscribe({
      next: (usager: UsagerLight) => {
        this.usager = new UsagerFormModel(usager);
        const name = getUsagerNomComplet(usager);
        this.titleService.setTitle("Documents de " + name);
      },
      error: () => {
        this.toastService.error("Le dossier recherché n'existe pas");
        this.router.navigate(["404"]);
      },
    });
  }

  public openEntretien(): void {
    this.editEntretien = !this.editEntretien;
  }

  public isRole(role: UserStructureRole): boolean {
    return this.me?.role === role;
  }
}
