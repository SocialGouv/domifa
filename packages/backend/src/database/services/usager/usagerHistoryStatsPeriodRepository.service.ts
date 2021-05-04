import {
  UsagerDecisionMotif,
  UsagerDecisionOrientation,
  UsagerDecisionStatut,
  UsagerHistoryStateCreationEvent,
  UsagerTypeDom,
} from "../../../_common/model";
import { typeOrmSearch } from "../_postgres/pgRepository.service";
import { usagerHistoryRepository } from "./usagerHistoryRepository.service";

export const usagerHistoryStatsPeriodRepository = {
  countDecisionsInPeriod,
};

function countDecisionsInPeriod({
  countType,
  dateDebutPeriode,
  dateFinPeriode,
  structureId,
  criteria,
  logSql,
}: {
  countType: "domicilie" | "ayant-droit";
  dateDebutPeriode: Date;
  dateFinPeriode: Date;
  structureId: number;
  criteria: {
    createdEvent: UsagerHistoryStateCreationEvent;
    typeDom?: UsagerTypeDom;
    decision: {
      statut?: UsagerDecisionStatut;
      motif?: UsagerDecisionMotif;
      orientation?: UsagerDecisionOrientation;
    };
  };
  logSql?: boolean;
}): Promise<number> {
  const { where, params } = buildQuery({
    dateDebutPeriode,
    dateFinPeriode,
    structureId,
    criteria,
  });

  const expression =
    countType === "domicilie"
      ? `COUNT("uuid")`
      : 'sum(jsonb_array_length("ayantsDroits"))';

  return usagerHistoryRepository.aggregateAsNumber({
    alias: "uh",
    where,
    params,
    expression,
    resultAlias: "count",
    logSql,
  });
}

function buildQuery({
  dateDebutPeriode,
  dateFinPeriode,
  structureId,
  criteria,
}: {
  dateDebutPeriode: Date;
  dateFinPeriode: Date;
  structureId: number;
  criteria: {
    createdEvent: UsagerHistoryStateCreationEvent;
    typeDom?: UsagerTypeDom;
    decision: {
      statut?: UsagerDecisionStatut;
      motif?: UsagerDecisionMotif;
      orientation?: UsagerDecisionOrientation;
    };
  };
}) {
  const { decision, createdEvent, typeDom } = criteria;
  const globalSubQueries: string[] = [];
  const params: {
    [attr: string]: any;
  } = {};
  if (structureId) {
    globalSubQueries.push(`"structureId" = :structureId`);
    params["structureId"] = structureId;
  }

  const statesSubQueries: string[] = [];

  const statesSubQueriesBase = `SELECT 1 FROM LATERAL (SELECT jsonb_array_elements(uh.states) state) states_lateral WHERE`;

  if (createdEvent) {
    statesSubQueries.push(
      `states_lateral.state->>'createdEvent' = :createdEvent`
    );
    params["createdEvent"] = createdEvent;
  }
  if (typeDom) {
    statesSubQueries.push(`states_lateral.state->>'typeDom' = :typeDom`);
    params["typeDom"] = typeDom;
  }

  if (decision?.statut) {
    statesSubQueries.push(
      `states_lateral.state->'decision'->>'statut' = :decisionStatut`
    );
    params["decisionStatut"] = decision?.statut;
  }

  if (decision?.motif) {
    statesSubQueries.push(
      `states_lateral.state->'decision'->>'motif' = :decisionMotif`
    );
    params["decisionMotif"] = decision?.motif;
  }
  if (decision?.orientation) {
    statesSubQueries.push(
      `states_lateral.state->'decision'->>'orientation' = :decisionOrientation`
    );
    params["decisionOrientation"] = decision?.orientation;
  }

  if (dateFinPeriode) {
    statesSubQueries.push(
      ` AND (histo.decision->>'dateDecision')::timestamptz <= :dateFinPeriode`
    );
    params["dateFinPeriode"] = dateFinPeriode;
  }
  if (dateDebutPeriode) {
    statesSubQueries.push(
      ` AND (histo.decision->>'dateDecision')::timestamptz >= :dateDebutPeriode`
    );
    params["dateDebutPeriode"] = dateDebutPeriode;
  }

  globalSubQueries.push(
    `EXISTS (${statesSubQueriesBase} ${statesSubQueries.join(" AND ")})`
  );

  const where = typeOrmSearch<any>(
    globalSubQueries.map((x) => `(${x})`).join(" AND ")
  );
  return { where, params };
}
