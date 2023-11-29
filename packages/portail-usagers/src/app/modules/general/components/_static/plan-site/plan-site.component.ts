import { Component, OnInit } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { faExternalLinkAlt } from "@fortawesome/free-solid-svg-icons";
import { LIENS_PARTENAIRES } from "./LIENS_PARTENAIRES.const";

@Component({
  selector: "app-plan-site",
  templateUrl: "./plan-site.component.html",
  styleUrls: ["./plan-site.component.css"],
})
export class PlanSiteComponent implements OnInit {
  public faExternalLinkAlt = faExternalLinkAlt;

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

  constructor(private readonly titleService: Title) {}

  public ngOnInit(): void {
    this.titleService.setTitle("Plan du site de Mon DomiFa");
  }
}
