import { Component, Input, OnInit } from "@angular/core";
import { UsagerFormModel } from "../../../../usager-shared/interfaces";
import { faFilePdf } from "@fortawesome/free-regular-svg-icons";
import {
  CerfaDocType,
  SortValues,
  USAGER_DECISION_STATUT_LABELS_PROFIL,
  UsagerDecision,
  UserStructure,
} from "@domifa/common";
import { DocumentService } from "../../../../usager-shared/services";

@Component({
  selector: "app-profil-historique-decisions",
  templateUrl: "./profil-historique-decisions.component.html",
  styleUrls: ["../historique-table.scss"],
})
export class ProfilHistoriqueDecisionsComponent implements OnInit {
  public readonly USAGER_DECISION_STATUT_LABELS_PROFIL =
    USAGER_DECISION_STATUT_LABELS_PROFIL;
  @Input({ required: true }) public me!: UserStructure;
  @Input({ required: true }) public usager!: UsagerFormModel;

  public sortValue: SortValues = "desc";
  public currentKey: keyof UsagerDecision = "dateDecision";
  public displayDeleteButton = false;
  public readonly faFilePdf = faFilePdf;
  constructor(private readonly documentService: DocumentService) {}
  ngOnInit() {
    this.displayDeleteButton =
      this.me?.role !== "facteur" && this.me?.role !== "agent";
  }

  public getCerfa(decisionUuid: string): void {
    return this.documentService.getCerfa(
      this.usager.ref,
      CerfaDocType.attestation,
      decisionUuid
    );
  }
}
