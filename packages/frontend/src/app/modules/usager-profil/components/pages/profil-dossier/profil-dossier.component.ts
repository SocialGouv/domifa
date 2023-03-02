import { Component } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { ActivatedRoute, Router } from "@angular/router";
import { CustomToastService } from "src/app/modules/shared/services/custom-toast.service";
import { UserStructureRole } from "../../../../../../_common/model";
import { AuthService } from "../../../../shared/services/auth.service";
import { UsagerProfilService } from "../../../services/usager-profil.service";
import { BaseUsagerProfilPageComponent } from "../base-usager-profil-page/base-usager-profil-page.component";

@Component({
  selector: "app-profil-dossier",
  templateUrl: "./profil-dossier.component.html",
  styleUrls: ["./profil-dossier.component.css"],
})
export class ProfilDossierComponent extends BaseUsagerProfilPageComponent {
  public editInfos: boolean;
  public editEntretien: boolean;

  constructor(
    public authService: AuthService,
    public usagerProfilService: UsagerProfilService,
    public titleService: Title,
    public toastService: CustomToastService,
    public route: ActivatedRoute,
    public router: Router
  ) {
    super(
      authService,
      usagerProfilService,
      titleService,
      toastService,
      route,
      router
    );
    this.titlePrefix = "Entretien";
  }

  public openEntretien(): void {
    this.editEntretien = !this.editEntretien;
  }

  public isRole(role: UserStructureRole): boolean {
    return this.me?.role === role;
  }
}
