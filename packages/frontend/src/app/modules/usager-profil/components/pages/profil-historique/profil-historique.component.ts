import { AfterViewInit, Component } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { ActivatedRoute, Router } from "@angular/router";
import { CustomToastService } from "src/app/modules/shared/services/custom-toast.service";

import { AuthService } from "../../../../shared/services/auth.service";
import { UsagerProfilService } from "../../../services/usager-profil.service";
import { BaseUsagerProfilPageComponent } from "../base-usager-profil-page/base-usager-profil-page.component";
import { Store } from "@ngrx/store";
import { UsagerState } from "../../../../../shared";

type HistorySections =
  | "decisions"
  | "interactions"
  | "notes"
  | "sms"
  | "procurations"
  | "login-portail"
  | "transferts";
@Component({
  selector: "app-profil-historique",
  templateUrl: "./profil-historique.component.html",
  styleUrls: ["profil-historique.component.scss"],
})
export class ProfilHistoriqueComponent
  extends BaseUsagerProfilPageComponent
  implements AfterViewInit
{
  public currentSection: HistorySections;

  public sectionsIds: HistorySections[] = [
    "decisions",
    "interactions",
    "procurations",
    "transferts",
    "sms",
    "notes",
    "login-portail",
  ];

  public sections: { id: HistorySections; name: string }[] = [
    {
      id: "decisions",
      name: "Décisions",
    },
    {
      id: "interactions",
      name: "Interactions",
    },
    {
      id: "notes",
      name: "Notes",
    },

    {
      id: "procurations",
      name: "Procurations",
    },
    {
      id: "transferts",
      name: "Tranferts",
    },
  ];

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
    this.currentSection = "interactions";
    this.titlePrefix = "Historique";
  }

  public goToPrint(): void {
    window.print();
  }

  ngAfterViewInit() {
    const section = this.route.snapshot.params?.section;

    if (!section || !this.sectionsIds.includes(section)) {
      this.toastService.error("Le dossier recherché n'existe pas");
      this.router.navigate(["404"]);
      return;
    }

    this.currentSection = section;
    if (this.me.structure.sms.enabledByStructure) {
      this.sections.push({
        id: "sms",
        name: "SMS envoyés",
      });
    }
    if (this.me.structure.portailUsager.enabledByStructure) {
      this.sections.push({
        id: "login-portail",
        name: "Connexions à Mon DomiFa",
      });
    }
  }
}
