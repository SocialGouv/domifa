import { typeOrmSearch } from "../../_postgres/pgRepository.service";
import { UsagerAvancedSearchCriteria } from "./UsagerAvancedSearchCriteria.type";

export const usagerAdvancedSearchQueryBuilder = {
  buildQuery,
};

function buildQuery({
  structureId,
  typeDom,
  actifsInHistoryBefore,
  decisionInHistory,
  decision,
  dateNaissance,
  entretien,
}: UsagerAvancedSearchCriteria) {
  // TODO @toub LATER ajouter données de test pour cas 2 et 3

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
      dateDebutAfter,
      dateFinAfter,
      dateDecisionBefore,
      dateDecisionAfter,
      statut,
      motif,
      orientation,
      typeDom: typeDomInHistory,
    } = decisionInHistory;
    let condition1 = `decision->>'statut' = :statut`;
    let condition2InExists = `SELECT 1 FROM LATERAL (SELECT jsonb_array_elements(u.historique) decision) histo WHERE
      histo.decision->>'statut' = :statut`;
    params["statut"] = statut;

    if (dateDebutBefore) {
      condition1 += ` AND (decision->>'dateDebut')::timestamptz <= :dateDebutBefore`;
      condition2InExists += ` AND (histo.decision->>'dateDebut')::timestamptz <= :dateDebutBefore`;
      params["dateDebutBefore"] = dateDebutBefore;
    }
    if (dateDebutAfter) {
      condition1 += ` AND (decision->>'dateDebut')::timestamptz >= :dateDebutAfter`;
      condition2InExists += ` AND (histo.decision->>'dateDebut')::timestamptz >= :dateDebutAfter`;
      params["dateDebutAfter"] = dateDebutAfter;
    }
    if (dateFinAfter) {
      condition1 += ` AND (decision->>'dateFin')::timestamptz >= :dateFinAfter`;
      condition2InExists += ` AND (histo.decision->>'dateFin')::timestamptz >= :dateFinAfter`;
      params["dateFinAfter"] = dateFinAfter;
    }
    if (dateDecisionBefore) {
      condition1 += ` AND (decision->>'dateDecision')::timestamptz <= :dateDecisionBefore`;
      condition2InExists += ` AND (histo.decision->>'dateDecision')::timestamptz <= :dateDecisionBefore`;
      params["dateDecisionBefore"] = dateDecisionBefore;
    }
    if (dateDecisionAfter) {
      condition1 += ` AND (decision->>'dateDecision')::timestamptz >= :dateDecisionAfter`;
      condition2InExists += ` AND (histo.decision->>'dateDecision')::timestamptz >= :dateDecisionAfter`;
      params["dateDecisionAfter"] = dateDecisionAfter;
    }

    if (motif) {
      condition1 += ` AND decision->>'motif' = :motif`;
      condition2InExists += ` AND histo.decision->>'motif' = :motif`;
      params["motif"] = motif;
    }
    if (orientation) {
      condition1 += ` AND decision->>'orientation' = :orientation`;
      condition2InExists += ` AND histo.decision->>'orientation' = :orientation`;
      params["orientation"] = orientation;
    }
    if (typeDomInHistory) {
      condition1 += ` AND decision->>'typeDom' = :typeDomInHistory`;
      condition2InExists += ` AND histo.decision->>'typeDom' = :typeDomInHistory`;
      params["typeDomInHistory"] = typeDomInHistory;
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
  const where = typeOrmSearch<any>(
    andSubQueries.map((x) => `(${x})`).join(" AND ")
  );
  return { where, params };
}
