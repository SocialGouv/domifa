import { BaseUsagerProfilPageComponent } from "./../base-usager-profil-page/base-usager-profil-page.component";
import { Component } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { ActivatedRoute, Router } from "@angular/router";
import { CustomToastService } from "src/app/modules/shared/services/custom-toast.service";
import { AuthService } from "../../../../shared/services/auth.service";
import { UsagerProfilService } from "../../../services/usager-profil.service";
import { Store } from "@ngrx/store";
import { UsagerState } from "../../../../../shared";

@Component({
  selector: "app-profil-courriers",
  templateUrl: "./profil-courriers.component.html",
})
export class ProfilCourriersComponent extends BaseUsagerProfilPageComponent {
  constructor(
    protected readonly authService: AuthService,
    protected readonly usagerProfilService: UsagerProfilService,
    protected readonly titleService: Title,
    protected readonly toastService: CustomToastService,
    protected readonly route: ActivatedRoute,
    protected readonly router: Router,
    protected readonly store: Store<UsagerState>
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
    this.section = "courrier";
  }
}
