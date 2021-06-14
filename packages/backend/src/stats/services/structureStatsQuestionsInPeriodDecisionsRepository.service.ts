import { usagerHistoryRepository } from "../../database";
import { StructureStatsQuestionsInPeriodDecisions } from "../../_common/model";

export const structureStatsQuestionsInPeriodDecisionsRepository = {
  getStats,
};

async function getStats({
  startDateUTC,
  endDateUTCExclusive,
  structureId,
}: {
  startDateUTC: Date;
  endDateUTCExclusive: Date;
  structureId: number;
}): Promise<StructureStatsQuestionsInPeriodDecisions> {
  const rawResults = await (
    await usagerHistoryRepository.typeorm()
  ).query(
    `
    select
    count(state->'uuid') filter (where state->'decision'->>'statut' = 'VALIDE') as u_decision_valide
    ,COALESCE(sum(jsonb_array_length(state->'ayantsDroits')) filter (where state->'decision'->>'statut' = 'VALIDE'), 0) as ad_decision_valide
    ,count(state->'uuid') filter (where state->'decision'->>'statut' = 'VALIDE' and state->>'typeDom' = 'PREMIERE_DOM') as u_decision_valide_typedom_premiere
    ,count(state->'uuid') filter (where state->'decision'->>'statut' = 'VALIDE' and state->>'typeDom' = 'RENOUVELLEMENT') as u_decision_valide_typedom_renouvellement
    ,count(state->'uuid') filter (where state->'decision'->>'statut' = 'RADIE') as u_decision_radie
    ,count(state->'uuid') filter (where state->'decision'->>'statut' = 'RADIE' and state->'decision'->>'motif' = 'A_SA_DEMANDE') as u_decision_radie_motif_a_sa_demande
    ,count(state->'uuid') filter (where state->'decision'->>'statut' = 'RADIE' and state->'decision'->>'motif' = 'ENTREE_LOGEMENT') as u_decision_radie_motif_entree_logement
    ,count(state->'uuid') filter (where state->'decision'->>'statut' = 'RADIE' and state->'decision'->>'motif' = 'FIN_DE_DOMICILIATION') as u_decision_radie_motif_fin_de_domiciliation
    ,count(state->'uuid') filter (where state->'decision'->>'statut' = 'RADIE' and state->'decision'->>'motif' = 'NON_MANIFESTATION_3_MOIS') as u_decision_radie_motif_non_manifestation_3_mois
    ,count(state->'uuid') filter (where state->'decision'->>'statut' = 'RADIE' and state->'decision'->>'motif' = 'NON_RESPECT_REGLEMENT') as u_decision_radie_motif_non_respect_reglement
    ,count(state->'uuid') filter (where state->'decision'->>'statut' = 'RADIE' and state->'decision'->>'motif' = 'PLUS_DE_LIEN_COMMUNE') as u_decision_radie_motif_plus_de_lien_commune
    ,count(state->'uuid') filter (where state->'decision'->>'statut' = 'RADIE' and state->'decision'->>'motif' = 'AUTRE') as u_decision_radie_motif_autre
    ,count(state->'uuid') filter (where state->'decision'->>'statut' = 'REFUS') as u_decision_refus
    ,count(state->'uuid') filter (where state->'decision'->>'statut' = 'REFUS' and state->'decision'->>'motif' = 'HORS_AGREMENT') as u_decision_refus_motif_hors_agrement
    ,count(state->'uuid') filter (where state->'decision'->>'statut' = 'REFUS' and state->'decision'->>'motif' = 'LIEN_COMMUNE') as u_decision_refus_motif_lien_commune
    ,count(state->'uuid') filter (where state->'decision'->>'statut' = 'REFUS' and state->'decision'->>'motif' = 'SATURATION') as u_decision_refus_motif_saturation
    ,count(state->'uuid') filter (where state->'decision'->>'statut' = 'REFUS' and state->'decision'->>'motif' = 'AUTRE') as u_decision_refus_motif_autre
    ,count(state->'uuid') filter (where state->'decision'->>'statut' = 'REFUS' and state->'decision'->>'orientation' = 'ccas') as u_decision_refus_orientation_ccas
    ,count(state->'uuid') filter (where state->'decision'->>'statut' = 'REFUS' and state->'decision'->>'orientation' = 'asso') as u_decision_refus_orientation_asso
    FROM "usager_history" "uh"
    join usager u on uh."usagerUUID" = u.uuid
    join jsonb_array_elements(uh.states) as state on true
    WHERE uh."structureId" = $1
 	and state->>'createdEvent' = 'new-decision'
    AND (state->'decision'->>'dateDecision')::timestamptz >= $2
    AND (state->'decision'->>'dateDecision')::timestamptz < $3;
`,
    [structureId, startDateUTC, endDateUTCExclusive]
  );

  if (rawResults.length === 1) {
    const r = rawResults[0];

    const stats: StructureStatsQuestionsInPeriodDecisions = {
      valid: {
        usagers: {
          total: parseInt(r.u_decision_valide, 10),
          premiere_demande: parseInt(r.u_decision_valide_typedom_premiere, 10),
          renouvellement: parseInt(
            r.u_decision_valide_typedom_renouvellement,
            10
          ),
        },
        ayantsDroits: {
          total: parseInt(r.ad_decision_valide, 10),
        },
      },
      radie: {
        total: parseInt(r.u_decision_radie, 10),
        motif: {
          a_sa_demande: parseInt(r.u_decision_radie_motif_a_sa_demande, 10),
          entree_logement: parseInt(
            r.u_decision_radie_motif_entree_logement,
            10
          ),
          fin_de_domiciliation: parseInt(
            r.u_decision_radie_motif_fin_de_domiciliation,
            10
          ),
          non_manifestation_3_mois: parseInt(
            r.u_decision_radie_motif_non_manifestation_3_mois,
            10
          ),
          non_respect_reglement: parseInt(
            r.u_decision_radie_motif_non_respect_reglement,
            10
          ),
          plus_de_lien_commune: parseInt(
            r.u_decision_radie_motif_plus_de_lien_commune,
            10
          ),
          autre: parseInt(r.u_decision_radie_motif_autre, 10),
        },
      },
      refus: {
        total: parseInt(r.u_decision_refus, 10), // Q13 :Nombre total de refus d'élection de domicile durant l'année
        motif: {
          hors_agrement: parseInt(r.u_decision_refus_motif_hors_agrement, 10),
          lien_commune: parseInt(r.u_decision_refus_motif_lien_commune, 10),
          saturation: parseInt(r.u_decision_refus_motif_saturation, 10),
          autre: parseInt(r.u_decision_refus_motif_autre, 10),
        },
        reorientation: {
          // Q_14: réorientation suite au refus d'élection de domicile
          ccas: parseInt(r.u_decision_refus_orientation_ccas, 10),
          asso: parseInt(r.u_decision_refus_orientation_asso, 10),
        },
      },
    };
    return stats;
  }
}
