import { Component, OnInit } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { faExternalLinkAlt } from "@fortawesome/free-solid-svg-icons";
import { UserStructure } from "../../../../../_common/model";
import { AuthService } from "../../../shared/services/auth.service";

@Component({
  selector: "app-plan-site",
  templateUrl: "./plan-site.component.html",
  styleUrls: ["./plan-site.component.css"],
})
export class PlanSiteComponent implements OnInit {
  public me!: UserStructure;

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

  public sitemapLinks: {
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
        { label: "Contacter l'équipe de Domifa", path: "/contact" },
        { label: "Foire aux questions", path: "/faq" },
        { label: "Mentions légales de Domifa", path: "/mentions-legales" },
        { label: "Conditions d’utilisation de Domifa", path: "/cgu" },
        { label: "Nouveautés", path: "/news" },
        { label: "Statistiques", path: "/stats" },
        { label: "Créer une structure", path: "/structures/inscription" },
        {
          label: "Réinitialiser mon mot de passe",
          path: "/users/reset-password",
        },
      ],
    },
  ];

  public partnerLinks = [
    {
      label: "La fabrique numérique",
      path: "https://www.fabrique.social.gouv.fr/",
    },
    { label: "Beta.gouv.fr", path: "https://beta.gouv.fr/" },
    {
      label: "France relance",
      path: "https://www.gouvernement.fr/les-priorites/france-relance",
    },
    {
      label: "Dihal",
      path: "https://www.gouvernement.fr/delegation-interministerielle-a-l-hebergement-et-a-l-acces-au-logement",
    },
    {
      label: "Ministère des solidarités et de la santé",
      path: "https://www.gouvernement.fr/le-ministere-des-solidarites-et-de-la-sante",
    },
    { label: "UNCCAS", path: "https://www.unccas.org/" },
  ];

  constructor(private titleService: Title, public authService: AuthService) {}

  public ngOnInit(): void {
    this.authService.currentUserSubject.subscribe((user: UserStructure) => {
      this.me = user;
    });

    this.titleService.setTitle("Plan de site de Domifa");
  }
}
