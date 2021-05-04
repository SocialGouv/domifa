import { Connection } from "typeorm";
import { structureRepository } from "../../../database";
import { AppTestHelper } from "../../../util/test";
import { structureStatsInPeriodGenerator } from "./structureStatsInPeriodGenerator.service";

describe("structureStatsInPeriodGenerator", () => {
  let postgresTypeormConnection: Connection;

  beforeAll(async () => {
    postgresTypeormConnection = await AppTestHelper.bootstrapTestConnection();
  });
  afterAll(async () => {
    AppTestHelper.tearDownTestConnection({ postgresTypeormConnection });
  });

  it("buildStatsInPeriod", async () => {
    const structure = await structureRepository.findOne({
      id: 1,
    });
    const startDateUTC = new Date(Date.UTC(2019, 10, 15));
    const endDateUTC = new Date(Date.UTC(2021, 1, 1));

    const {
      startDate,
      endDate,
      stats,
    } = await structureStatsInPeriodGenerator.buildStatsInPeriod({
      structure,
      startDateUTC,
      endDateUTC,
    });
    expect(startDate).toEqual(startDateUTC);
    expect(endDate).toEqual(endDateUTC);
    expect(stats).toBeDefined();
    expect(stats.questions).toBeDefined();
    expect(stats.questions).toEqual({
      Q_10: 1,
      Q_10_A: 1,
      Q_10_B: 0,
      Q_11: {
        RADIE: 1,
        REFUS: 1,
        VALIDE: 3,
        VALIDE_AYANTS_DROIT: 4,
        VALIDE_TOTAL: 7,
      },
      Q_12: {
        AUTRE: 0,
        A_SA_DEMANDE: 0,
        ENTREE_LOGEMENT: 0,
        FIN_DE_DOMICILIATION: 0,
        NON_MANIFESTATION_3_MOIS: 0,
        NON_RESPECT_REGLEMENT: 0,
        PLUS_DE_LIEN_COMMUNE: 0,
        TOTAL: 0,
      },
      Q_13: {
        AUTRE: 0,
        HORS_AGREMENT: 0,
        LIEN_COMMUNE: 0,
        SATURATION: 0,
        TOTAL: 0,
      },
      Q_14: {
        ASSO: 0,
        CCAS: 0,
      },
      Q_19: {
        COUPLE_AVEC_ENFANT: 1,
        COUPLE_SANS_ENFANT: 0,
        FEMME_ISOLE_AVEC_ENFANT: 1,
        FEMME_ISOLE_SANS_ENFANT: 0,
        HOMME_ISOLE_AVEC_ENFANT: 0,
        HOMME_ISOLE_SANS_ENFANT: 0,
      },
      Q_20: {
        appel: 0,
        colisIn: 4,
        colisOut: 0,
        courrierIn: 4,
        courrierOut: 0,
        npai: 0,
        recommandeIn: 3,
        recommandeOut: 0,
        visite: 1,
      },
      Q_21: {
        AUTRE: 0,
        ERRANCE: 1,
        EXPULSION: 0,
        HEBERGE_SANS_ADRESSE: 0,
        ITINERANT: 0,
        NON_RENSEIGNE: 1,
        RAISON_DEMANDE: {
          AUTRE: 1,
          EXERCICE_DROITS: 1,
          PRESTATIONS_SOCIALES: 0,
        },
        RUPTURE: 0,
        SORTIE_STRUCTURE: 0,
        VIOLENCE: 1,
      },
      Q_22: {
        AUTRE: 0,
        DOMICILE_MOBILE: 1,
        HEBERGEMENT_SOCIAL: 0,
        HEBERGEMENT_TIERS: 1,
        HOTEL: 0,
        NON_RENSEIGNE: 1,
        SANS_ABRI: 0,
      },
      USAGERS: {
        SEXE: {
          F: 1,
          H: 2,
        },
        TRANCHE_AGE: {
          T_0_14: 0,
          T_15_19: 0,
          T_20_24: 1,
          T_25_29: 0,
          T_30_34: 1,
          T_35_39: 0,
          T_40_44: 1,
          T_45_49: 0,
          T_50_54: 0,
          T_55_59: 0,
          T_60_64: 0,
          T_65_69: 0,
          T_70_74: 0,
          T_75_PLUS: 0,
        },
      },
    });
  });
});
