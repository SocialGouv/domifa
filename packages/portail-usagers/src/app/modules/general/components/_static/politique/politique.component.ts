import { Component } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { DsfrColumn } from "@edugouvfr/ngx-dsfr";
import { MatomoTracker } from "ngx-matomo-client";

@Component({
  selector: "app-politique",
  templateUrl: "./politique.component.html",
})
export class PolitiqueComponent {
  optedOut$: Promise<boolean>;
  public columns: DsfrColumn[] = [
    {
      label: "Sous-traitant",
      field: "sousTraitant",
      sortable: false,
    },
    {
      label: "Pays destinataire",
      field: "paysDestinataire",
      sortable: false,
    },
    {
      label: "Traitement réalisé",
      field: "traitementRealise",
      sortable: false,
    },
    {
      label: "Garanties",
      field: "garanties",
      sortable: false,
    },
  ];

  public data = [
    {
      sousTraitant: "OVH",
      paysDestinataire: "France",
      traitementRealise: "Hébergement",
      garanties:
        "https://storage.gra.cloud.ovh.net/v1/AUTH_325716a587c64897acbef9a4a4726e38/contracts/9e74492-OVH_Data_Protection_Agreement-FR-6.0.pdf",
    },
    {
      sousTraitant: "Tally",
      paysDestinataire: "Belgique",
      traitementRealise: "Mesure de satisfaction",
      garanties: "https://tally.so/help/privacy-policy",
    },
    {
      sousTraitant: "Brevo",
      paysDestinataire: "France",
      traitementRealise: "Envoi de courriels",
      garanties:
        "https://www.brevo.com/fr/legal/termsofuse/#accord-sur-le-traitement-des-donnees-a-caractere-personnel-dpa",
    },
    {
      sousTraitant: "Link Mobility",
      paysDestinataire: "France",
      traitementRealise: "Envoi de sms",
      garanties:
        "https://www.linkmobility.com/resources/legal/terms-and-conditions/DPA_LINK_as_Processor_V1-43_2021.pdf",
    },
    {
      sousTraitant: "Sarbacane",
      paysDestinataire: "Espagne",
      traitementRealise: "Envoi de notifications",
      garanties:
        "https://assets.sarbacane-cdn.com/legal/EN_DataProcessingAddendum.pdf",
    },
  ];
  public constructor(
    private readonly titleService: Title,
    private readonly tracker: MatomoTracker,
  ) {
    this.optedOut$ = tracker.isUserOptedOut();
    this.titleService.setTitle("Politique de confidentialité de Mon DomiFa");
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  handleChange(optOut: any) {
    if (optOut) {
      this.tracker.optUserOut();
      localStorage.setItem("matomo-opted-in", JSON.stringify(false));
    } else {
      localStorage.setItem("matomo-opted-in", JSON.stringify(true));
      this.tracker.forgetUserOptOut();
    }

    this.optedOut$ = this.tracker.isUserOptedOut();
  }
}
