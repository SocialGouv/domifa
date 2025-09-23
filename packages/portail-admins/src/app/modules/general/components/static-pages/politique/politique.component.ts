import { Component, OnInit } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { DsfrColumn } from "@edugouvfr/ngx-dsfr";

@Component({
  selector: "app-politique",
  templateUrl: "./politique.component.html",
})
export class PolitiqueComponent implements OnInit {
  public constructor(private readonly titleService: Title) {}
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
  ];
  public ngOnInit(): void {
    this.titleService.setTitle(
      "Politique de confidentialité du portail Admin DomiFa"
    );
  }
}
