import { Component, OnInit } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { faExternalLinkAlt } from "@fortawesome/free-solid-svg-icons";
import { AuthService } from "../../../shared/services/auth.service";
import { LIENS_PARTENAIRES } from "./LIENS_PARTENAIRES.const";
import { REGIONS_LISTE, REGIONS_ID_SEO } from "../../../../shared";

@Component({
  selector: "app-plan-site",
  templateUrl: "./plan-site.component.html",
  styleUrls: ["./plan-site.component.css"],
})
export class PlanSiteComponent implements OnInit {
  public readonly REGIONS_LISTE = REGIONS_LISTE;
  public readonly REGIONS_ID_SEO = REGIONS_ID_SEO;

  public faExternalLinkAlt = faExternalLinkAlt;
  public siteMapLinksLogged: {
    section: string;
    links: {
      label: string;
      path: string;
    }[];
  }[] = [
    {
      section: "Gérer les domiciliés",
      links: [
        { label: "Importer des domiciliés", path: "/import" },
        { label: "Liste des domiciliés", path: "/manage" },
        { label: "Créer un domicilié", path: "/usager/nouveau" },
      ],
    },
    {
      section: "Gérer ma structure",
      links: [
        { label: "Documents de la structure", path: "/structures/documents" },
        { label: "Modifier ma structure", path: "/structures/edit" },
        { label: "Activer ou désactiver les SMS", path: "/structures/sms" },
        {
          label: "Modifier les accès au portail des usagers",
          path: "/structures/portail-usager",
        },
        { label: "Rapport d'activité", path: "/stats/rapport-activite" },
      ],
    },
    {
      section: "Gérer mon compte",
      links: [
        { label: "Mon compte", path: "/users/mon-compte" },
        { label: "Gérer les comptes de ma structure", path: "/users/comptes" },
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
        { label: "Se connecter", path: "/connexion" },
        { label: "Contacter l'équipe de DomiFa", path: "/contact" },
        { label: "Foire aux questions", path: "/faq" },
        { label: "Mentions légales de DomiFa", path: "/mentions-legales" },
        { label: "Déclaration d’accessibilité", path: "/accessibilite" },
        { label: "Conditions d’utilisation de DomiFa", path: "/cgu" },
        {
          label:
            "Conditions d’utilisation de DomiFa du responsable de structure",
          path: "/cgu-responsable",
        },
        { label: "Nouveautés", path: "/news" },
        { label: "Statistiques", path: "/stats" },
        { label: "Notre impact", path: "/stats/impact" },
        { label: "Créer une structure", path: "/structures/inscription" },
        {
          label: "Réinitialiser mon mot de passe",
          path: "/users/reset-password",
        },
      ],
    },
  ];

  public readonly partnerLinks = LIENS_PARTENAIRES;

  constructor(private titleService: Title, public authService: AuthService) {}

  public ngOnInit(): void {
    this.titleService.setTitle("Plan de site de DomiFa");
  }
}
