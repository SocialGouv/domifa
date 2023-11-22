import {
  USAGER_DECISION_STATUT_LABELS_PROFIL,
  UsagerTypeDom,
  UsagerDecisionStatut,
  UsagerDecisionMotif,
  UsagerDecisionOrientation,
  UsagerDecision,
  generateMotifLabel,
} from "@domifa/common";

export class Decision implements UsagerDecision {
  public uuid: string;
  public dateDebut: Date;
  public dateFin: Date | null;
  public dateDecision: Date; // Now()

  public typeDom: UsagerTypeDom;
  public statut: UsagerDecisionStatut;
  public statutLabel: string;
  // Motif de refus ou radiation
  public motif?: UsagerDecisionMotif;
  public motifDetails?: string;

  // Motif + détail
  public motifString?: string;

  // Orientation si refus
  public orientation?: UsagerDecisionOrientation;
  public orientationDetails?: string;

  public userId: number; // UserStructure.id
  public userName: string; // UserStructure.nom / prenom

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(decision?: any) {
    this.uuid = decision?.uuid;
    this.typeDom = decision?.typeDom;
    this.dateDebut = (decision && new Date(decision.dateDebut)) ?? undefined;
    this.dateFin = (decision && new Date(decision.dateFin)) ?? undefined;
    this.dateDecision =
      (decision && new Date(decision.dateDecision)) ?? new Date();
    this.statut = decision?.statut ?? "INSTRUCTION";

    this.userName = decision?.userName ?? "";
    this.userId = decision?.userId ?? "";
    this.motifDetails = decision?.motifDetails ?? "";
    this.motif = decision?.motif ?? "";
    this.motifString = "";

    this.orientation = decision?.orientation ?? "";
    this.orientationDetails = decision?.orientationDetails ?? "";

    this.statutLabel = USAGER_DECISION_STATUT_LABELS_PROFIL[this.statut];

    if (decision?.statut) {
      this.motifString = generateMotifLabel(decision);
    }
  }
}
