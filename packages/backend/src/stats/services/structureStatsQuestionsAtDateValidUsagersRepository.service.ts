import { usagerHistoryRepository } from "../../database";
import { StructureStatsQuestionsAtDateValidUsagers } from "../../_common/model";

export const structureStatsQuestionsAtDateValidUsagersRepository = {
  getStats,
};

async function getStats({
  dateUTC,
  structureId,
}: {
  dateUTC: Date;
  structureId: number;
}): Promise<StructureStatsQuestionsAtDateValidUsagers> {
  // TODO pas besoin de précalculer usager_tranche, on peut faire comme v_u_age_mineur
  const rawResults = await (
    await usagerHistoryRepository.typeorm()
  ).query(
    `
    select 
    count(distinct uh."usagerUUID") as v_u
    ,COALESCE(sum(jsonb_array_length(state->'ayantsDroits')), 0) as v_ad
    ,count(distinct uh."usagerUUID") filter (where u.sexe = 'homme') as v_u_sexe_h
    ,count(distinct uh."usagerUUID") filter (where u.sexe = 'femme') as v_u_sexe_f
    ,count(distinct uh."usagerUUID") filter (where date_part('year',age($2, u."dateNaissance"))::int < 18) as v_u_age_mineur
    ,count(distinct uh."usagerUUID") filter (where date_part('year',age($2, u."dateNaissance"))::int >= 18) as v_u_age_majeur
    ,count(distinct usager_tranche.uuid) filter (where usager_tranche.tranche_age = 'T_0_14') as v_u_age_0_14
    ,count(distinct usager_tranche.uuid) filter (where usager_tranche.tranche_age = 'T_15_19') as v_u_age_15_19
    ,count(distinct usager_tranche.uuid) filter (where usager_tranche.tranche_age = 'T_20_24') as v_u_age_20_24
    ,count(distinct usager_tranche.uuid) filter (where usager_tranche.tranche_age = 'T_25_29') as v_u_age_25_29
    ,count(distinct usager_tranche.uuid) filter (where usager_tranche.tranche_age = 'T_30_34') as v_u_age_30_34
    ,count(distinct usager_tranche.uuid) filter (where usager_tranche.tranche_age = 'T_35_39') as v_u_age_35_39
    ,count(distinct usager_tranche.uuid) filter (where usager_tranche.tranche_age = 'T_40_44') as v_u_age_40_44
    ,count(distinct usager_tranche.uuid) filter (where usager_tranche.tranche_age = 'T_45_49') as v_u_age_45_49
    ,count(distinct usager_tranche.uuid) filter (where usager_tranche.tranche_age = 'T_50_54') as v_u_age_50_54
    ,count(distinct usager_tranche.uuid) filter (where usager_tranche.tranche_age = 'T_55_59') as v_u_age_55_59
    ,count(distinct usager_tranche.uuid) filter (where usager_tranche.tranche_age = 'T_60_64') as v_u_age_60_64
    ,count(distinct usager_tranche.uuid) filter (where usager_tranche.tranche_age = 'T_65_69') as v_u_age_65_69
    ,count(distinct usager_tranche.uuid) filter (where usager_tranche.tranche_age = 'T_70_74') as v_u_age_70_74
    ,count(distinct usager_tranche.uuid) filter (where usager_tranche.tranche_age = 'T_75_PLUS') as v_u_age_75_plus
    ,COALESCE(sum(state_ayant_droit_agg.count_mineur), 0) as v_ad_age_mineur
    ,COALESCE(sum(state_ayant_droit_agg.count_majeur), 0) as v_ad_age_majeur
    ,count(distinct uh."usagerUUID") filter (where date_part('year',age($2, u."dateNaissance"))::int >= 18) as v_u_age_majeur
    ,count(distinct uh."usagerUUID") filter (where state->'entretien'->>'typeMenage' = 'COUPLE_AVEC_ENFANT') as v_u_menage_cae
    ,count(distinct uh."usagerUUID") filter (where state->'entretien'->>'typeMenage' = 'COUPLE_SANS_ENFANT') as v_u_menage_cse
    ,count(distinct uh."usagerUUID") filter (where state->'entretien'->>'typeMenage' = 'FEMME_ISOLE_AVEC_ENFANT') as v_u_menage_fiae
    ,count(distinct uh."usagerUUID") filter (where state->'entretien'->>'typeMenage' = 'FEMME_ISOLE_SANS_ENFANT') as v_u_menage_fise
    ,count(distinct uh."usagerUUID") filter (where state->'entretien'->>'typeMenage' = 'HOMME_ISOLE_AVEC_ENFANT') as v_u_menage_hiae
    ,count(distinct uh."usagerUUID") filter (where state->'entretien'->>'typeMenage' = 'HOMME_ISOLE_SANS_ENFANT') as v_u_menage_hise
    ,count(distinct uh."usagerUUID") filter (where state->'entretien'->'typeMenage' is null or state->'entretien'->'typeMenage' = 'null') as v_u_menage_nr
    ,count(distinct uh."usagerUUID") filter (where state->'entretien'->>'cause' = 'ERRANCE') as v_u_cause_errance
    ,count(distinct uh."usagerUUID") filter (where state->'entretien'->>'cause' = 'EXPULSION') as v_u_cause_expulsion
    ,count(distinct uh."usagerUUID") filter (where state->'entretien'->>'cause' = 'HEBERGE_SANS_ADRESSE') as v_u_cause_heb_sans_addr
    ,count(distinct uh."usagerUUID") filter (where state->'entretien'->>'cause' = 'ITINERANT') as v_u_cause_itinerance
    ,count(distinct uh."usagerUUID") filter (where state->'entretien'->>'cause' = 'RUPTURE') as v_u_cause_rupture
    ,count(distinct uh."usagerUUID") filter (where state->'entretien'->>'cause' = 'SORTIE_STRUCTURE') as v_u_cause_sortie_struct
    ,count(distinct uh."usagerUUID") filter (where state->'entretien'->>'cause' = 'VIOLENCE') as v_u_cause_violence
    ,count(distinct uh."usagerUUID") filter (where state->'entretien'->>'cause' = 'AUTRE') as v_u_cause_autre
    ,count(distinct uh."usagerUUID") filter (where state->'entretien'->'cause' is null or state->'entretien'->'cause' = 'null' or state->'entretien'->>'cause' = 'NON_RENSEIGNE') as v_u_cause_nr
    ,count(distinct uh."usagerUUID") filter (where state->'entretien'->>'raison' = 'EXERCICE_DROITS') as v_u_raison_exercice_droits
    ,count(distinct uh."usagerUUID") filter (where state->'entretien'->>'raison' = 'PRESTATIONS_SOCIALES') as v_u_raison_prestations_sociales
    ,count(distinct uh."usagerUUID") filter (where state->'entretien'->>'raison' = 'AUTRE') as v_u_raison_autre
    ,count(distinct uh."usagerUUID") filter (where state->'entretien'->'raison' is null or state->'entretien'->'raison' = 'null' or state->'entretien'->>'raison' = 'NON_RENSEIGNE') as v_u_raison_nr
    ,count(distinct uh."usagerUUID") filter (where state->'entretien'->>'residence' = 'DOMICILE_MOBILE') as v_u_residence_domicile_mobile
    ,count(distinct uh."usagerUUID") filter (where state->'entretien'->>'residence' = 'HEBERGEMENT_SOCIAL') as v_u_residence_hebergement_social
    ,count(distinct uh."usagerUUID") filter (where state->'entretien'->>'residence' = 'HEBERGEMENT_TIERS') as v_u_residence_hebergement_tiers
    ,count(distinct uh."usagerUUID") filter (where state->'entretien'->>'residence' = 'HOTEL') as v_u_residence_hotel
    ,count(distinct uh."usagerUUID") filter (where state->'entretien'->>'residence' = 'SANS_ABRI') as v_u_residence_sans_abri
    ,count(distinct uh."usagerUUID") filter (where state->'entretien'->>'residence' = 'AUTRE') as v_u_residence_autre
    ,count(distinct uh."usagerUUID") filter (where state->'entretien'->'residence' is null or state->'entretien'->'residence' = 'null' or state->'entretien'->>'residence' = 'NON_RENSEIGNE') as v_u_residence_nr
    FROM "usager_history" "uh"
    join usager u on uh."usagerUUID" = u.uuid
    join jsonb_array_elements(uh.states) as state on true
    left join lateral(
      select state->'uuid' as "stateUUID", 
      count(state_ayant_droit) filter (where date_part('year',age($2, (state_ayant_droit->>'dateNaissance')::timestamptz))::int < 18) as count_mineur,
      count(state_ayant_droit) filter (where date_part('year',age($2, (state_ayant_droit->>'dateNaissance')::timestamptz))::int >= 18) as count_majeur
      from jsonb_array_elements (state->'ayantsDroits') as state_ayant_droit
      where true
      group by state->'uuid'
    ) as state_ayant_droit_agg on true
    join (select u2.uuid, CASE
      WHEN date_part('year',age($2, u2."dateNaissance"))::int < 15  THEN 'T_0_14'
      WHEN date_part('year',age($2, u2."dateNaissance"))::int < 20  THEN 'T_15_19'
      WHEN date_part('year',age($2, u2."dateNaissance"))::int < 25  THEN 'T_20_24'
      WHEN date_part('year',age($2, u2."dateNaissance"))::int < 30  THEN 'T_25_29'
      WHEN date_part('year',age($2, u2."dateNaissance"))::int < 35  THEN 'T_30_34'
      WHEN date_part('year',age($2, u2."dateNaissance"))::int < 40  THEN 'T_35_39'
      WHEN date_part('year',age($2, u2."dateNaissance"))::int < 45  THEN 'T_40_44'
      WHEN date_part('year',age($2, u2."dateNaissance"))::int < 50  THEN 'T_45_49'
      WHEN date_part('year',age($2, u2."dateNaissance"))::int < 55  THEN 'T_50_54'
      WHEN date_part('year',age($2, u2."dateNaissance"))::int < 60  THEN 'T_55_59'
      WHEN date_part('year',age($2, u2."dateNaissance"))::int < 65  THEN 'T_60_64'
      WHEN date_part('year',age($2, u2."dateNaissance"))::int < 70  THEN 'T_65_69'
      WHEN date_part('year',age($2, u2."dateNaissance"))::int < 75  THEN 'T_70_74'
    ELSE 'T_75_PLUS'
    end as tranche_age
    from usager u2
    ) as usager_tranche on usager_tranche.uuid = u.uuid
    WHERE uh."structureId" = $1
    -- states_lateral.state->>'createdEvent' = 'new-decision' 
    and (state->>'isActive')::boolean
    AND (state->>'historyBeginDate')::timestamptz < $2
    AND (state->>'historyEndDate' is null or (state->>'historyEndDate')::timestamptz >= $2)
`,
    [structureId, dateUTC]
  );

  if (rawResults.length === 1) {
    const r = rawResults[0];
    const totalUsagers = parseInt(r.v_u, 10);
    const totalAyantsDroits = parseInt(r.v_ad, 10);
    const stats: StructureStatsQuestionsAtDateValidUsagers = {
      total: {
        // Q11
        usagers: totalUsagers,
        ayantsDroits: totalAyantsDroits,
        usagerEtAyantsDroits: totalUsagers + totalAyantsDroits,
      },
      menage: {
        // Q19
        couple_avec_enfant: parseInt(r.v_u_menage_cae, 10),
        couple_sans_enfant: parseInt(r.v_u_menage_cse, 10),
        femme_isole_avec_enfant: parseInt(r.v_u_menage_fiae, 10),
        femme_isole_sans_enfant: parseInt(r.v_u_menage_fise, 10),
        homme_isole_avec_enfant: parseInt(r.v_u_menage_hiae, 10),
        homme_isole_sans_enfant: parseInt(r.v_u_menage_hise, 10),
        non_renseigne: parseInt(r.v_u_menage_nr, 10),
      },
      cause: {
        // Q21
        autre: parseInt(r.v_u_cause_autre, 10),
        errance: parseInt(r.v_u_cause_errance, 10),
        expulsion: parseInt(r.v_u_cause_expulsion, 10),
        heberge_sans_adresse: parseInt(r.v_u_cause_heb_sans_addr, 10),
        itinerant: parseInt(r.v_u_cause_itinerance, 10),
        rupture: parseInt(r.v_u_cause_rupture, 10),
        sortie_structure: parseInt(r.v_u_cause_sortie_struct, 10),
        violence: parseInt(r.v_u_cause_violence, 10),
        non_renseigne: parseInt(r.v_u_cause_nr, 10),
      },
      raison: {
        // Q21
        exercice_droits: parseInt(r.v_u_raison_exercice_droits, 10),
        prestations_sociales: parseInt(r.v_u_raison_prestations_sociales, 10),
        autre: parseInt(r.v_u_raison_autre, 10),
        non_renseigne: parseInt(r.v_u_raison_nr, 10),
      },
      residence: {
        // Q22
        domicile_mobile: parseInt(r.v_u_residence_domicile_mobile, 10),
        hebergement_social: parseInt(r.v_u_residence_hebergement_social, 10),
        hebergement_tiers: parseInt(r.v_u_residence_hebergement_tiers, 10),
        hotel: parseInt(r.v_u_residence_hotel, 10),
        sans_abri: parseInt(r.v_u_residence_sans_abri, 10),
        autre: parseInt(r.v_u_residence_autre, 10),
        non_renseigne: parseInt(r.v_u_residence_nr, 10),
      },
      age: {
        usagers: {
          mineurs: parseInt(r.v_u_age_mineur, 10),
          majeurs: parseInt(r.v_u_age_majeur, 10),
          t_0_14: parseInt(r.v_u_age_0_14, 10),
          t_15_19: parseInt(r.v_u_age_15_19, 10),
          t_20_24: parseInt(r.v_u_age_20_24, 10),
          t_25_29: parseInt(r.v_u_age_25_29, 10),
          t_30_34: parseInt(r.v_u_age_30_34, 10),
          t_35_39: parseInt(r.v_u_age_35_39, 10),
          t_40_44: parseInt(r.v_u_age_40_44, 10),
          t_45_49: parseInt(r.v_u_age_45_49, 10),
          t_50_54: parseInt(r.v_u_age_50_54, 10),
          t_55_59: parseInt(r.v_u_age_55_59, 10),
          t_60_64: parseInt(r.v_u_age_60_64, 10),
          t_65_69: parseInt(r.v_u_age_65_69, 10),
          t_70_74: parseInt(r.v_u_age_70_74, 10),
          t_75_plus: parseInt(r.v_u_age_75_plus, 10),
        },
        ayantsDroits: {
          mineurs: parseInt(r.v_ad_age_mineur, 10),
          majeurs: parseInt(r.v_ad_age_majeur, 10),
        },
      },
      sexe: {
        h: parseInt(r.v_u_sexe_h, 10),
        f: parseInt(r.v_u_sexe_f, 10),
      },
    };
    return stats;
  }
}
