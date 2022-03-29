import { buildCustomDoc } from ".";
import { AppTestHelper } from "../../util/test";
import { STRUCTURE_MOCK } from "../../_common/mocks";
import { usagerRefusMock } from "../../_common/mocks/usagerRefus.mock";
import { usagerValideMock } from "../../_common/mocks/usagerValideMock.mock";
import { StructureCustomDocTags } from "../../_common/model";
import { dateFormat, DATE_FORMAT } from "./buildCustomDoc.service";
import { generatedAttestationMock, generatedRefusMock } from "./mocks";

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
        usager: usagerValideMock,
        structure: STRUCTURE_MOCK,
        date,
        extraParameters,
      });

      expect(docRadiation).toEqual({
        ...generatedAttestationMock,
        ...extraParameters,
      });
    });
  });

  describe("Générer le contenu des attestations et courriers", () => {
    it("1. ATTESTATION POSTALE", async () => {
      const date = new Date("2020-12-15 14:30:00");
      const docActif: StructureCustomDocTags = buildCustomDoc({
        usager: usagerValideMock,
        structure: STRUCTURE_MOCK,
        date,
      });

      expect(docActif).toEqual(generatedAttestationMock);
    });

    it("2. CUSTOM DOC - REFUS DE RENOUVELLEMENT", async () => {
      const date = new Date("2020-12-15 14:30:00");

      const usager = usagerRefusMock;
      usager.typeDom = "RENOUVELLEMENT";

      const docActif: StructureCustomDocTags = buildCustomDoc({
        usager: usagerRefusMock,
        structure: STRUCTURE_MOCK,
        date,
      });

      expect(docActif).toEqual(generatedRefusMock);
    });

    it("4. CUSTOM DOC AVEC PROCURATION & TRANSFERT", async () => {
      const date = new Date("2020-12-15 14:30:00");

      usagerValideMock.options = {
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
        usager: usagerValideMock,
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
    it("America/Cayenne : Heure d'hiver à Paris -4h", async () => {
      // Même date que le précédent test
      const date = new Date("2022-03-23 14:32:00");

      const usager = usagerRefusMock;
      usager.typeDom = "RENOUVELLEMENT";

      // Doit être 4 heures plus tôt
      STRUCTURE_MOCK.timeZone = "America/Cayenne";
      const testDoc: StructureCustomDocTags = buildCustomDoc({
        usager: usagerRefusMock,
        structure: STRUCTURE_MOCK,
        date,
      });

      expect(testDoc.DATE_JOUR_HEURE).toEqual("23/03/2022 à 10:32");
    });

    it("America/Cayenne : Heure d'été à Paris -5h", async () => {
      // Même date que le précédent test
      const date = new Date("2022-05-23 14:32:00");

      const usager = usagerRefusMock;
      usager.typeDom = "RENOUVELLEMENT";

      // Doit être 4 heures plus tôt
      STRUCTURE_MOCK.timeZone = "America/Cayenne";
      const testDoc: StructureCustomDocTags = buildCustomDoc({
        usager: usagerRefusMock,
        structure: STRUCTURE_MOCK,
        date,
      });

      expect(testDoc.DATE_JOUR_HEURE).toEqual("23/05/2022 à 09:32");
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
