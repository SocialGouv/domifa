import { BaseUsagerProfilPageComponent } from "./../base-usager-profil-page/base-usager-profil-page.component";
import { Component } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { ActivatedRoute, Router } from "@angular/router";
import { CustomToastService } from "src/app/modules/shared/services/custom-toast.service";
import { AuthService } from "../../../../shared/services/auth.service";
import { UsagerProfilService } from "../../../services/usager-profil.service";
import { Store } from "@ngrx/store";

@Component({
  selector: "app-profil-courriers",
  templateUrl: "./profil-courriers.component.html",
})
export class ProfilCourriersComponent extends BaseUsagerProfilPageComponent {
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
    this.titlePrefix = "Courriers";
  }
}
