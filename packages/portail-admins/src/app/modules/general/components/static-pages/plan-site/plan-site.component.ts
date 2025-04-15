import { Component, OnDestroy, OnInit } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { faExternalLinkAlt } from "@fortawesome/free-solid-svg-icons";
import { LIENS_PARTENAIRES } from "./LIENS_PARTENAIRES.const";
import { AdminAuthService } from "../../../../admin-auth/services/admin-auth.service";
import { Subscription } from "rxjs";
import { PortailAdminUser } from "@domifa/common";

@Component({
  selector: "app-plan-site",
  templateUrl: "./plan-site.component.html",
  styleUrls: ["./plan-site.component.css"],
})
export class PlanSiteComponent implements OnInit, OnDestroy {
  public faExternalLinkAlt = faExternalLinkAlt;
  public siteMapLinksLogged: {
    section: string;
    links: {
      label: string;
      path: string;
    }[];
  }[] = [
    {
      section: "Gérer les structures",
      links: [
        { label: "Rapports d'activité", path: "/structures/rapports" },
        { label: "Liste des structures", path: "/structures" },
      ],
    },
  ];

  public readonly sitemapLinks: {
    section: string;
    links: {
      label: string;
      path: string;
    }[];
  }[] = [
    {
      section: "Général",
      links: [
        { label: "Accueil", path: "/" },
        { label: "Se connecter à DomiFa", path: "/auth/login" },
        { label: "Mentions légales de DomiFa", path: "/mentions-legales" },
        { label: "Déclaration d’accessibilité", path: "/accessibilite" },
        { label: "Conditions d’utilisation de DomiFa", path: "/cgu" },
      ],
    },
  ];
  public adminProfile!: PortailAdminUser | null;
  private readonly subscription = new Subscription();
  public readonly partnerLinks = LIENS_PARTENAIRES;

  constructor(
    private readonly titleService: Title,
    private readonly adminAuthService: AdminAuthService
  ) {
    this.adminProfile = null;
  }

  public ngOnInit(): void {
    this.subscription.add(
      this.adminAuthService.currentAdminSubject.subscribe(
        (apiResponse: PortailAdminUser | null) => {
          this.adminProfile = apiResponse;
        }
      )
    );
    this.titleService.setTitle("Plan du site de DomiFa");
  }

  public ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
