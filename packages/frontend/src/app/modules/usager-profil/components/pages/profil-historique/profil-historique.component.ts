import { Component, OnInit } from "@angular/core";
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

type HistorySection = { id: HistorySections; name: string };

@Component({
  selector: "app-profil-historique",
  templateUrl: "./profil-historique.component.html",
  styleUrls: ["profil-historique.component.scss"],
  standalone: false,
})
export class ProfilHistoriqueComponent
  extends BaseUsagerProfilPageComponent
  implements OnInit
{
  public currentSection: HistorySection | null = null;
  public sections: HistorySection[] = [];

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
    this.titlePrefix = "Historique";
    this.section = "historique";
  }

  public ngOnInit(): void {
    this.sections = this.buildSections();
    super.ngOnInit();

    // Section is driven by the URL so that browser back/forward stays in sync
    this.subscription.add(
      this.route.paramMap.subscribe((params) => {
        const section = this.sections.find(
          (item) => item.id === params.get("section")
        );

        if (!section) {
          this.toastService.error("Le dossier recherché n'existe pas");
          this.router.navigate(["404"]);
          return;
        }

        this.currentSection = section;
        if (this.usager) {
          this.setTitle();
        }
      })
    );
  }

  public setTitle(): void {
    const sectionName = this.currentSection
      ? ` - ${this.currentSection.name}`
      : "";
    this.titleService.setTitle(
      `${this.titlePrefix}${sectionName} de ${this.usager.fullName} - DomiFa`
    );
  }

  public goToPrint(): void {
    window.print();
  }

  private buildSections(): HistorySection[] {
    const sections: HistorySection[] = [
      { id: "decisions", name: "Décisions" },
      { id: "interactions", name: "Interactions" },
      { id: "notes", name: "Notes" },
      { id: "procurations", name: "Procurations" },
      { id: "transferts", name: "Transferts" },
    ];

    const structure = this.me?.structure;
    if (structure?.sms.enabledByDomifa && structure?.sms.enabledByStructure) {
      sections.push({ id: "sms", name: "SMS envoyés" });
    }
    if (
      structure?.portailUsager.enabledByDomifa &&
      structure?.portailUsager.enabledByStructure
    ) {
      sections.push({ id: "login-portail", name: "Connexions à Mon DomiFa" });
    }
    return sections;
  }
}
