import {
  UsagerDecisionMotif,
  UsagerDecisionOrientation,
  UsagerDecisionStatut,
  UsagerEntretien,
  UsagerTypeDom,
} from "../../../../_common/model";

export type UsagerAvancedSearchCriteria = {
  structureId?: number;
  typeDom?: UsagerTypeDom;
  actifsInHistoryBefore?: Date;
  decisionInHistory?: {
    statut: UsagerDecisionStatut;
    dateDebutBefore?: Date;
    dateDecisionBefore?: Date;
    motif?: UsagerDecisionMotif;
    orientation?: UsagerDecisionOrientation;
  };
  decision?: {
    dateDecisionBefore: Date;
    statut: UsagerDecisionStatut;
  };
  dateNaissance?: {
    min?: Date;
    max?: Date;
  };
  entretien?: Partial<
    Pick<UsagerEntretien, "cause" | "typeMenage" | "residence">
  >;
  logSql?: boolean;
};
