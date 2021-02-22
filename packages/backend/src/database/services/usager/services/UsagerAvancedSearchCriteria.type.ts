import { UsagerDecisionMotif } from "../../../entities/usager/UsagerDecisionMotif.type";
import { UsagerDecisionOrientation } from "../../../entities/usager/UsagerDecisionOrientation.type";
import { UsagerDecisionStatut } from "../../../entities/usager/UsagerDecisionStatut.type";
import { UsagerEntretien } from "../../../entities/usager/UsagerEntretien.type";
import { UsagerTypeDom } from "../../../entities/usager/UsagerTypeDom.type";

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
