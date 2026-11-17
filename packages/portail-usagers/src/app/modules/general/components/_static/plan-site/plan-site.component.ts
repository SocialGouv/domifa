import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { LIENS_PARTENAIRES } from "./LIENS_PARTENAIRES.const";
import { SeoService } from "../../../../shared/services/seo.service";

interface SitemapLink {
  label: string;
  path: string;
  external?: boolean;
  children?: SitemapLink[];
}

interface SitemapSection {
  section: string;
  description?: string;
  links: SitemapLink[];
}

@Component({
  selector: "app-plan-site",
  templateUrl: "./plan-site.component.html",
  imports: [CommonModule, RouterModule],
})
export class PlanSiteComponent implements OnInit {
  public readonly sitemapLinks: SitemapSection[] = [
    {
      section: "Général",
      links: [
        { label: "Connexion à Mon DomiFa", path: "/auth/login" },
        { label: "Nouveautés sur Mon DomiFa", path: "/news" },
        { label: "Mentions légales de Mon DomiFa", path: "/mentions-legales" },
        { label: "Déclaration d’accessibilité", path: "/accessibilite" },
        {
          label: "Conditions générales d’utilisation de Mon DomiFa",
          path: "/cgu",
        },
        {
          label: "Politique de confidentialité de Mon DomiFa",
          path: "/confidentialite",
        },
      ],
    },
    {
      section: "Mon compte",
      description: "Pages accessibles après connexion.",
      links: [
        { label: "Mon espace", path: "/account" },
        { label: "Historique des interactions", path: "/account/historique" },
      ],
    },
    {
      section: "Aide",
      links: [
        {
          label: "Les questions fréquentes",
          path: "/faq",
          children: [
            { label: "Généralités", path: "/faq/generalites" },
            { label: "Accès et connexion", path: "/faq/acces-connexion" },
            {
              label: "Fonctionnalités disponibles",
              path: "/faq/fonctionnalites",
            },
            {
              label: "Sécurité et confidentialité",
              path: "/faq/securite-confidentialite",
            },
            {
              label: "Assistance technique Mon DomiFa",
              path: "/faq/assistance-technique",
            },
          ],
        },
        {
          label: "Contact",
          path: "https://tally.so/r/wz8Na8",
          external: true,
        },
      ],
    },
  ];

  public readonly partnerLinks = LIENS_PARTENAIRES;

  constructor(private readonly seoService: SeoService) {}

  public ngOnInit(): void {
    this.seoService.updateTitleAndTags(
      "Plan du site de Mon DomiFa",
      "Navigation complète du portail Mon DomiFa : accès aux pages principales et liens utiles"
    );
  }
}
