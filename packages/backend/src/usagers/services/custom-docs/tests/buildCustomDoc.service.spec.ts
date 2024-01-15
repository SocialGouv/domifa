import { buildCustomDoc } from "..";
import { AppTestHelper } from "../../../../util/test";
import {
  STRUCTURE_MOCK,
  USAGER_REFUS_MOCK,
  USAGER_VALIDE_MOCK,
} from "../../../../_common/mocks";

import { StructureCustomDocTags } from "../../../../_common/model";
import { dateFormat, DATE_FORMAT } from "../buildCustomDoc.service";
import { CUSTOM_DOC_ATTESTATION_POSTALE, CUSTOM_DOC_COURRIER_REFUS } from ".";

describe("buildCustomDoc.service", () => {
  beforeAll(async () => {
    await AppTestHelper.bootstrapTestApp({});
  });

  describe("Générer les documents du portail-usager", () => {
    it("Generate data for ACCESS ESPACE DOMICILIE", async () => {
      const date = new Date("2020-12-15 14:30:00");
      const extraParameters = {
        ESPACE_DOM_URL: "https://mon-domifa",
        ESPACE_DOM_ID: "my-login",
        ESPACE_DOM_MDP: "my-password",
      };
      const docRadiation: StructureCustomDocTags = buildCustomDoc({
        usager: USAGER_VALIDE_MOCK,
        structure: STRUCTURE_MOCK,
        date,
        extraParameters,
      });

      expect(docRadiation).toEqual({
        ...CUSTOM_DOC_ATTESTATION_POSTALE,
        ...extraParameters,
      });
    });
  });

  describe("Générer le contenu des attestations et courriers", () => {
    it("1. ATTESTATION POSTALE", async () => {
      const date = new Date("2020-12-15 14:30:00");
      const docActif: StructureCustomDocTags = buildCustomDoc({
        usager: USAGER_VALIDE_MOCK,
        structure: STRUCTURE_MOCK,
        date,
      });

      expect(docActif).toEqual(CUSTOM_DOC_ATTESTATION_POSTALE);
    });

    it("2. CUSTOM DOC - REFUS DE RENOUVELLEMENT", async () => {
      const date = new Date("2020-12-15 14:30:00");

      const usager = USAGER_REFUS_MOCK;

      usager.typeDom = "RENOUVELLEMENT";

      const docActif: StructureCustomDocTags = buildCustomDoc({
        usager: USAGER_REFUS_MOCK,
        structure: STRUCTURE_MOCK,
        date,
      });

      expect(docActif).toEqual(CUSTOM_DOC_COURRIER_REFUS);

      // Test des numéros de distribution
      const docNumeroDistribution: StructureCustomDocTags = buildCustomDoc({
        usager: { ...USAGER_REFUS_MOCK, numeroDistribution: "TSA 20000" },
        structure: STRUCTURE_MOCK,
        date,
      });

      expect(docNumeroDistribution.USAGER_NUMERO_DISTRIBUTION_SPECIALE).toEqual(
        "TSA 20000"
      );
    });

    it("4. CUSTOM DOC AVEC PROCURATION & TRANSFERT", async () => {
      const date = new Date("2020-12-15 14:30:00");

      USAGER_VALIDE_MOCK.options = {
        transfert: {
          actif: true,
          nom: "Nom de l'établissement",
          adresse: "Adresse du transfert",
          dateDebut: new Date("2022-12-20 10:35:00"),
          dateFin: new Date("2023-09-04 14:30:00"),
        },
        procurations: [
          {
            nom: "Nom du mandataire",
            prenom: "Prénom du mandataire",
            dateDebut: new Date("2022-12-20 14:30:00"),
            dateFin: new Date("2023-09-04 14:30:00"),
            dateNaissance: new Date("1998-12-12 04:30:00"),
          },
        ],
        npai: {
          actif: false,
        },
        portailUsagerEnabled: false,
      };

      const customDocGenerated: StructureCustomDocTags = buildCustomDoc({
        usager: USAGER_VALIDE_MOCK,
        structure: STRUCTURE_MOCK,
        date,
      });

      expect(customDocGenerated.TRANSFERT_ACTIF).toEqual("OUI");
      expect(customDocGenerated.TRANSFERT_NOM).toEqual(
        "Nom de l'établissement"
      );
      expect(customDocGenerated.TRANSFERT_ADRESSE).toEqual(
        "Adresse du transfert"
      );
      expect(customDocGenerated.TRANSFERT_DATE_DEBUT).toEqual("20/12/2022");
      expect(customDocGenerated.TRANSFERT_DATE_FIN).toEqual("04/09/2023");

      // Procuration
      expect(customDocGenerated.PROCURATION_ACTIF).toEqual("OUI");
      expect(customDocGenerated.PROCURATIONS_LISTE).toEqual(
        "Nom du mandataire Prénom du mandataire né(e) le 12/12/1998 - Du 20/12/2022 au 04/09/2023"
      );

      expect(customDocGenerated.PROCURATION_PRENOM).toEqual(
        "Prénom du mandataire"
      );
      expect(customDocGenerated.PROCURATION_NOM).toEqual("Nom du mandataire");
      expect(customDocGenerated.PROCURATION_DATE_DEBUT).toEqual("20/12/2022");
      expect(customDocGenerated.PROCURATION_DATE_FIN).toEqual("04/09/2023");
      expect(customDocGenerated.PROCURATION_DATE_NAISSANCE).toEqual(
        "12/12/1998"
      );
    });
  });

  describe("[TIMEZONE] Vérifier que l'heure s'affiche correctement selon la timeZone", () => {
    it("America/Cayenne : Heure d'été à Paris -5h (heure d'été)", async () => {
      // Même date que le précédent test
      const date = new Date("April 12, 2022 15:43:00");

      const usager = USAGER_REFUS_MOCK;
      usager.typeDom = "RENOUVELLEMENT";

      // Doit être 4 heures plus tôt
      STRUCTURE_MOCK.timeZone = "America/Cayenne";
      const testDoc: StructureCustomDocTags = buildCustomDoc({
        usager: USAGER_REFUS_MOCK,
        structure: STRUCTURE_MOCK,
        date,
      });

      expect(testDoc.DATE_JOUR_HEURE).toEqual("12/04/2022 à 10:43");
    });

    it("America/Cayenne : Heure d'hiver à Paris -4h", async () => {
      // Même date que le précédent test
      const date = new Date("March 23, 2022 09:32:00");

      const usager = USAGER_REFUS_MOCK;
      usager.typeDom = "RENOUVELLEMENT";

      // Doit être 4 heures plus tôt
      STRUCTURE_MOCK.timeZone = "America/Cayenne";
      const testDoc: StructureCustomDocTags = buildCustomDoc({
        usager: USAGER_REFUS_MOCK,
        structure: STRUCTURE_MOCK,
        date,
      });

      expect(testDoc.DATE_JOUR_HEURE).toEqual("23/03/2022 à 05:32");
    });
  });

  describe("dateFormat : doit retourner une date dans le format souhaité à la bonne timeZone", () => {
    it("Dates au format string", async () => {
      const dateForTest = "January 21, 2022 15:35:00";

      //  "dd/MM/yyyy",
      expect(dateFormat(dateForTest, "Europe/Paris", DATE_FORMAT.JOUR)).toEqual(
        "21/01/2022"
      );
      //  "dd/MM/yyyy à HH:mm",
      expect(
        dateFormat(dateForTest, "Europe/Paris", DATE_FORMAT.JOUR_HEURE)
      ).toEqual("21/01/2022 à 15:35");
      //  "PPP",
      expect(
        dateFormat(dateForTest, "Europe/Paris", DATE_FORMAT.JOUR_LONG)
      ).toEqual("21 janvier 2022");
    });

    it("Dates au format Date", async () => {
      const dateForTest = new Date("October 12, 2019 15:05:00");
      //  "dd/MM/yyyy",
      expect(
        dateFormat(dateForTest, "America/Cayenne", DATE_FORMAT.JOUR)
      ).toEqual("12/10/2019");
      //  "dd/MM/yyyy à HH:mm",
      expect(
        dateFormat(dateForTest, "America/Cayenne", DATE_FORMAT.JOUR_HEURE)
      ).toEqual("12/10/2019 à 10:05");
      //  "PPP",
      expect(
        dateFormat(dateForTest, "America/Cayenne", DATE_FORMAT.JOUR_LONG)
      ).toEqual("12 octobre 2019");
    });
  });
});
