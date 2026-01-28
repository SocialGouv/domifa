import { Component } from "@angular/core";
import { DsfrTimelineEvent } from "@edugouvfr/ngx-dsfr-ext";
import { MatomoTracker } from "ngx-matomo-client";

@Component({
  selector: "app-decouvrir-domifa",
  templateUrl: "./decouvrir-domifa.component.html",
  styleUrls: ["./decouvrir-domifa.component.css"],
})
export class DecouvrirDomifaComponent {
  public timelineEvent: DsfrTimelineEvent[] = [
    {
      heading: "Juin 2018",
      description:
        "Face à une demande croissante du terrain, l’ouverture d’un appel à projets de l’incubateur des ministères sociaux à l’été 2018 marque un tournant : c’est la genèse de DomiFa. La DRJSCS-AURA propose le développement d’une plateforme en ligne permettant de sécuriser et d’optimiser la gestion des domiciliations administratives.",
      actions: [],
      headingLevel: "H2",
    },
    {
      heading: "Avril 2019",
      description:
        "Une première version du service est mise en ligne. Testée auprès des structures domiciliatrices des régions Auvergne-Rhône-Alpes, Île-de-France et Hauts-de-France.",
      actions: [],
      headingLevel: "H2",
    },
    {
      heading: "Février 2022",
      description:
        "Création d’un portail pour les domiciliés, Mon DomiFa, dédié au suivi de la domiciliation et l’arrivée de courrier.",
      actions: [],
      headingLevel: "H2",
    },
    {
      heading: "Février 2024",
      description:
        "DomiFa est reconnu service numérique à impact national par la Direction interministérielle du numérique (DINUM).",
      actions: [],
      headingLevel: "H2",
    },
    {
      heading: "Décembre 2025",
      description:
        "DomiFa est reconnu service numérique à impact national par la Direction interministérielle du numérique (DINUM). ",
      actions: [],
      headingLevel: "H2",
    },
  ];

  constructor(public matomo: MatomoTracker) {}
}
