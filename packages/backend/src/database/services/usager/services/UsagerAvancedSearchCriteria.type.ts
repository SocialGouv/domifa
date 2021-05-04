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
    dateDebutAfter?: Date;
    dateDebutBefore?: Date;
    dateFinAfter?: Date;
    dateDecisionBefore?: Date;
    dateDecisionAfter?: Date;
    motif?: UsagerDecisionMotif;
    orientation?: UsagerDecisionOrientation;
    typeDom?: UsagerTypeDom;
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
