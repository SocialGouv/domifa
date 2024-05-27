import { Component, OnInit } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { faExternalLinkAlt } from "@fortawesome/free-solid-svg-icons";
import { AuthService } from "../../../shared/services/auth.service";
import { LIENS_PARTENAIRES } from "./LIENS_PARTENAIRES.const";
import { REGIONS_LISTE, REGIONS_ID_SEO } from "@domifa/common";

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
        { label: "Informations de la structure", path: "/structures/edit" },
        { label: "Gérer l'envoi des SMS", path: "/structures/sms" },
        {
          label: "Gérer le portail domiciliés",
          path: "/structures/portail-usager",
        },
        {
          label: "Rapport d'activité",
          path: "/structure-stats",
        },
      ],
    },
    {
      section: "Compte et utilisateurs",
      links: [
        { label: "Gérer mon compte", path: "/users/mon-compte" },
        { label: "Gérer les utilisateurs", path: "/users/comptes" },
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
        { label: "Se connecter à DomiFa", path: "/connexion" },
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
        { label: "Consulter les statistiques de DomiFa", path: "/stats" },
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

  constructor(
    private readonly titleService: Title,
    public authService: AuthService
  ) {}

  public ngOnInit(): void {
    this.titleService.setTitle("Plan du site de DomiFa");
  }
}
