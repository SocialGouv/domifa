import { Component, OnInit } from "@angular/core";
import { LIENS_PARTENAIRES } from "./LIENS_PARTENAIRES.const";
import { SeoService } from "../../../../shared/services/seo.service";

@Component({
  selector: "app-plan-site",
  templateUrl: "./plan-site.component.html",
})
export class PlanSiteComponent implements OnInit {
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
        { label: "Accueil, mon compte", path: "/" },
        { label: "Se connecter à Mon DomiFa", path: "/auth/login" },
        { label: "Mentions légales de Mon DomiFa", path: "/mentions-legales" },
        { label: "Déclaration d’accessibilité", path: "/accessibilite" },
        { label: "Conditions d’utilisation de Mon DomiFa", path: "/cgu" },
      ],
    },
  ];

  public readonly partnerLinks = LIENS_PARTENAIRES;

  constructor(private readonly seoService: SeoService) {}

  public ngOnInit(): void {
    this.seoService.updateTitleAndTags(
      "Plan du site de Mon DomiFa",
      "Navigation complète du portail Mon DomiFa : accès aux pages principales et liens utiles",
    );
  }
}
