import { Component } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { ActivatedRoute, Router } from "@angular/router";
import { AuthService } from "../../../../shared/services/auth.service";
import { UsagerProfilService } from "../../../services/usager-profil.service";
import { BaseUsagerProfilPageComponent } from "../base-usager-profil-page/base-usager-profil-page.component";
import { Store } from "@ngrx/store";
import { UsagerState } from "../../../../../shared";
import { CustomToastService } from "../../../../shared/services";

@Component({
  selector: "app-profil-dossier",
  templateUrl: "./profil-dossier.component.html",
  standalone: false,
})
export class ProfilDossierComponent extends BaseUsagerProfilPageComponent {
  public editInfos = false;
  public editEntretien = false;
  public editContactDetails = false;

  constructor(
    public authService: AuthService,
    public usagerProfilService: UsagerProfilService,
    public titleService: Title,
    public toastService: CustomToastService,
    public route: ActivatedRoute,
    public router: Router,
    public store: Store<UsagerState>
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
    this.section = "dossier";
  }

  public openEntretien(): void {
    this.editEntretien = !this.editEntretien;
  }

  public openContactForm(): void {
    this.editContactDetails = !this.editContactDetails;
  }
}
