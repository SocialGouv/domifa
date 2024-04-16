import { AppTestHelper } from "../../util/test";
import { structureStatsInPeriodGenerator } from "./structureStatsInPeriodGenerator.service";

describe("structureStatsInPeriodGenerator", () => {
  beforeAll(async () => {
    await AppTestHelper.bootstrapTestConnection();
  });
  afterAll(async () => {
    await AppTestHelper.tearDownTestConnection();
  });

  it("buildStatsInPeriod", async () => {
    const startDateUTC = new Date(Date.UTC(2019, 10, 15));
    const endDateUTC = new Date(Date.UTC(2021, 1, 1));
    const endDateUTCExclusive = new Date(Date.UTC(2021, 1, 2));

    const stats = await structureStatsInPeriodGenerator.buildStatsInPeriod({
      structureId: 1,
      startDateUTC,
      endDateUTCExclusive,
    });

    expect(stats.structure.id).toEqual(1);
    expect(stats.period.startDateUTC).toEqual(startDateUTC);
    expect(stats.period.endDateUTC).toEqual(endDateUTC);
    expect(stats.period.endDateUTCExclusive).toEqual(endDateUTCExclusive);
    expect(stats).toBeDefined();

    expect(stats.data).toEqual({
      decisions: {
        radie: {
          motif: {
            a_sa_demande: 0,
            autre: 0,
            entree_logement: 0,
            fin_de_domiciliation: 0,
            non_manifestation_3_mois: 0,
            non_respect_reglement: 0,
            plus_de_lien_commune: 0,
          },
          total: 0,
        },
        refus: {
          motif: { autre: 0, hors_agrement: 0, lien_commune: 0, saturation: 0 },
          reorientation: { asso: 0, ccas: 0, cias: 0, other: 0 },
          total: 0,
        },
        valid: {
          ayantsDroits: { total: 1 },
          usagers: { premiere_demande: 1, renouvellement: 0, total: 1 },
        },
      },
      interactions: {
        appel: 0,
        allVisites: 0,
        colisIn: 4,
        colisOut: 0,
        colisOutForwarded: 0,
        courrierIn: 1, // 4 de base - 3 distribués dans les tests
        courrierOut: 0,
        courrierOutForwarded: 0,
        recommandeIn: 3,
        recommandeOut: 0,
        recommandeOutForwarded: 0,
        visite: 0,
        visiteOut: 0,
        loginPortail: 0,
        usagerRef: 0,
      },
      validUsagers: {
        accompagnement: {
          non: 1,
          non_renseigne: 1,
          oui: 1,
        },
        age: {
          ayantsDroits: { majeurs: 3, mineurs: 1 },
          usagers: {
            majeurs: 3,
            mineurs: 0,
            t_0_17: 0,
            t_18_25: 1,
            t_26_29: 0,
            t_30_34: 1,
            t_35_39: 0,
            t_40_44: 1,
            t_45_49: 0,
            t_50_54: 0,
            t_55_59: 0,
            t_60_64: 0,
            t_65_69: 0,
            t_70_74: 0,
            t_75_plus: 0,
          },
        },
        cause: {
          autre: 0,
          errance: 1,
          expulsion: 0,
          heberge_sans_adresse: 0,
          itinerant: 0,
          non_renseigne: 1,
          rupture: 0,
          sortie_hospitalisation: 0,
          sortie_incarceration: 0,
          sortie_structure: 0,
          violence: 1,
        },
        liencommune: {
          autre: 0,
          familial: 0,
          non_renseigne: 3,
          parental: 0,
          professionnel: 0,
          residentiel: 0,
          social: 0,
        },
        menage: {
          couple_avec_enfant: 1,
          couple_sans_enfant: 0,
          femme_isole_avec_enfant: 1,
          femme_isole_sans_enfant: 0,
          homme_isole_avec_enfant: 0,
          homme_isole_sans_enfant: 0,
          non_renseigne: 1,
        },
        raison: {
          autre: 1,
          exercice_droits: 1,
          non_renseigne: 1,
          prestations_sociales: 0,
          exercice_activite_pro: 0,
          lutte_violence: 0,
        },
        residence: {
          autre: 0,
          domicile_mobile: 1,
          hebergement_social: 0,
          hebergement_tiers: 1,
          hotel: 0,
          non_renseigne: 1,
          sans_abri: 0,
        },
        sexe: { f: 1, h: 2 },
        situationPro: {
          aah: 0,
          autre: 0,
          etudiant: 0,
          france_travail: 0,
          independant: 0,
          non_renseigne: 3,
          retraite: 0,
          rsa: 0,
          salarie: 0,
        },
        total: { ayantsDroits: 4, usagerEtAyantsDroits: 7, usagers: 3 },
        typeDom: {
          premiere: 2,
          renouvellement: 1,
        },
      },
    });
  });
});
