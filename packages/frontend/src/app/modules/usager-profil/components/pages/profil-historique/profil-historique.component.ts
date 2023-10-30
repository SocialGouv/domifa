import { Component } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { ActivatedRoute, Router } from "@angular/router";
import { CustomToastService } from "src/app/modules/shared/services/custom-toast.service";

import { HISTORY_ACTIONS } from "../../../../../../_common/model";
import { AuthService } from "../../../../shared/services/auth.service";
import { UsagerProfilService } from "../../../services/usager-profil.service";
import { BaseUsagerProfilPageComponent } from "../base-usager-profil-page/base-usager-profil-page.component";
import { Store } from "@ngrx/store";
import { USAGER_DECISION_STATUT_LABELS_PROFIL } from "@domifa/common";

@Component({
  selector: "app-profil-historique",
  templateUrl: "./profil-historique.component.html",
})
export class ProfilHistoriqueComponent extends BaseUsagerProfilPageComponent {
  public readonly HISTORY_ACTIONS = HISTORY_ACTIONS;

  public readonly USAGER_DECISION_STATUT_LABELS_PROFIL =
    USAGER_DECISION_STATUT_LABELS_PROFIL;

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

    this.titlePrefix = "Historique";
  }
}
