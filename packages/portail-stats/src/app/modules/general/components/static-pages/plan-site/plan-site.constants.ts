import { SiteMapSection } from "./plan-site.types";

export const SITEMAP_LINKS_LOGGED: SiteMapSection[] = [
  {
    section: "Pilotage",
    links: [{ label: "Statistiques de la domiciliation", path: "/stats" }],
  },
];

export const SITEMAP_LINKS: SiteMapSection[] = [
  {
    section: "Général",
    links: [
      { label: "Accueil", path: "/" },
      { label: "Se connecter", path: "/auth/login" },
      { label: "Mentions légales de DomiFa", path: "/mentions-legales" },
      { label: "Conditions d’utilisation de DomiFa", path: "/cgu" },
      { label: "Politique de confidentialité", path: "/confidentialite" },
    ],
  },
];
