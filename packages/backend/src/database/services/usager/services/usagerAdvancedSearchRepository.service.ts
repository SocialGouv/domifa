import { typeOrmSearch } from "../../_postgres/pgRepository.service";
import { UsagerAvancedSearchCriteria } from "./UsagerAvancedSearchCriteria.type";
import { usagerCoreRepository } from "./usagerCoreRepository.service";

export const usagerAdvancedSearchRepository = {
  _advancedCount,
};

/* don't use directly: use usagerRepository instead */
function _advancedCount({
  countType,
  structureId,
  typeDom,
  actifsInHistoryBefore,
  decisionInHistory,
  decision,
  dateNaissance,
  entretien,
}: UsagerAvancedSearchCriteria & {
  countType: "domicilie" | "ayant-droit";
}): Promise<number> {
  // TODO @toub ajouter données de test pour cas 2 et 3

  // CAS 1 : demande valide maintenant
  // CAS 2 : renouvellement en cours : demande Valide dernièrement mais instruction
  // CAS 3 : renouvellement en cours : demande Valide dernièrement mais en attente de décision
  const andSubQueries: string[] = [];
  const params: {
    [attr: string]: any;
  } = {};
  if (structureId) {
    andSubQueries.push(`"structureId" = :structureId`);
    params["structureId"] = structureId;
  }
  if (typeDom) {
    andSubQueries.push(`"typeDom" = :typeDom`);
    params["typeDom"] = typeDom;
  }
  if (actifsInHistoryBefore) {
    // CAS 1 : demande valide maintenant
    // CAS 2 : renouvellement en cours : demande Valide dernièrement mais instruction
    // CAS 3 : renouvellement en cours : demande Valide dernièrement mais en attente de décision
    andSubQueries.push(`decision->>'statut' = 'VALIDE' and (decision->>'dateDebut')::timestamptz <= :actifsInHistoryBefore
      OR (
        decision->>'statut' = 'INSTRUCTION'
        and (historique->>0)::jsonb->>'statut' = 'VALIDE' and ((historique->>0)::jsonb->>'dateDebut')::timestamptz <= :actifsInHistoryBefore
      )
      OR (
        decision->>'statut' = 'ATTENTE_DECISION'
        and (historique->>1)::jsonb->>'statut' = 'VALIDE' and ((historique->>1)::jsonb->>'dateDebut')::timestamptz <= :actifsInHistoryBefore
      )
    `);
    params["actifsInHistoryBefore"] = actifsInHistoryBefore;
  }
  if (decisionInHistory) {
    const {
      dateDebutBefore,
      dateDecisionBefore,
      statut,
      motif,
      orientation,
    } = decisionInHistory;
    let condition1 = `decision->>'statut' = :statut`;
    let condition2InExists = `SELECT 1 FROM LATERAL (SELECT jsonb_array_elements(u.historique) decision) y WHERE
        decision->>'statut' = :statut`;
    params["statut"] = statut;
    params["dateDebutBefore"] = dateDebutBefore;
    params["dateDecisionBefore"] = dateDecisionBefore;

    if (dateDebutBefore) {
      condition1 += ` AND (decision->>'dateDebut')::timestamptz <= :dateDebutBefore`;
      condition2InExists += ` AND (decision->>'dateDebut')::timestamptz <= :dateDebutBefore`;
      params["dateDebutBefore"] = dateDebutBefore;
    }
    if (dateDecisionBefore) {
      condition1 += ` AND (decision->>'dateDecision')::timestamptz <= :dateDecisionBefore`;
      condition2InExists += ` AND (decision->>'dateDecision')::timestamptz <= :dateDecisionBefore`;
      params["dateDecisionBefore"] = dateDecisionBefore;
    }

    if (motif) {
      condition1 += ` AND decision->>'motif' = :motif`;
      condition2InExists += ` AND decision->>'motif' = :motif`;
      params["motif"] = motif;
    }
    if (orientation) {
      condition1 += ` AND decision->>'orientation' = :orientation`;
      condition2InExists += ` AND decision->>'orientation' = :orientation`;
      params["orientation"] = orientation;
    }

    andSubQueries.push(`(${condition1}) OR EXISTS (${condition2InExists})`);
  }

  if (decision?.statut) {
    andSubQueries.push(
      `decision->>'statut' = :decisionStatut and (decision->>'dateDecision')::timestamptz < :dateDecisionBefore`
    );
    params["decisionStatut"] = decision.statut;
    params["dateDecisionBefore"] = decision.dateDecisionBefore;
  }
  if (dateNaissance?.min) {
    andSubQueries.push(`"dateNaissance" >= :dateNaissanceMin`);
    params["dateNaissanceMin"] = dateNaissance.min;
  }
  if (dateNaissance?.max) {
    andSubQueries.push(`"dateNaissance" <= :dateNaissanceMax`);
    params["dateNaissanceMax"] = dateNaissance.max;
  }
  if (entretien?.cause) {
    if (entretien.cause === "NON_RENSEIGNE") {
      andSubQueries.push(`entretien->>'cause' IS NULL`);
    } else {
      andSubQueries.push(`entretien->>'cause' = :entretienCause`);
      params["entretienCause"] = entretien.cause;
    }
  }
  if (entretien?.residence) {
    if (entretien.residence === "NON_RENSEIGNE") {
      andSubQueries.push(`entretien->>'residence' IS NULL`);
    } else {
      andSubQueries.push(`entretien->>'residence' = :entretienResidence`);
      params["entretienResidence"] = entretien.residence;
    }
  }
  if (entretien?.typeMenage) {
    if (entretien.typeMenage === "NON_RENSEIGNE") {
      andSubQueries.push(`entretien->>'typeMenage' IS NULL`);
    } else {
      andSubQueries.push(`entretien->>'typeMenage' = :entretienTypeMenage`);
      params["entretienTypeMenage"] = entretien.typeMenage;
    }
  }

  const expression =
    countType === "domicilie"
      ? `COUNT("uuid")`
      : 'sum(jsonb_array_length("ayantsDroits"))';

  return usagerCoreRepository.aggregateAsNumber({
    alias: "u",
    where: typeOrmSearch<any>(andSubQueries.map((x) => `(${x})`).join(" AND ")),
    params,
    expression,
    resultAlias: "count",
  });
}
