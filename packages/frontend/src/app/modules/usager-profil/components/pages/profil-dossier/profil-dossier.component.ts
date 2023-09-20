import { Component } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { ActivatedRoute, Router } from "@angular/router";
import { CustomToastService } from "src/app/modules/shared/services/custom-toast.service";
import { AuthService } from "../../../../shared/services/auth.service";
import { UsagerProfilService } from "../../../services/usager-profil.service";
import { BaseUsagerProfilPageComponent } from "../base-usager-profil-page/base-usager-profil-page.component";
import { Store } from "@ngrx/store";

@Component({
  selector: "app-profil-dossier",
  templateUrl: "./profil-dossier.component.html",
})
export class ProfilDossierComponent extends BaseUsagerProfilPageComponent {
  public editInfos = false;
  public editEntretien = false;

  constructor(
    public authService: AuthService,
    public usagerProfilService: UsagerProfilService,
    public titleService: Title,
    public toastService: CustomToastService,
    public route: ActivatedRoute,
    public router: Router,
    public store: Store
  ) {
    super(
      authService,
      usagerProfilService,
      titleService,
      toastService,
      route,
      router,
      store
    );
    this.titlePrefix = "État-civil et entretien";
  }

  public openEntretien(): void {
    this.editEntretien = !this.editEntretien;
  }
}
