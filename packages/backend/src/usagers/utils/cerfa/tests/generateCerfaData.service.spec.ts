import {
  structureRepository,
  usagerRepository,
  userStructureRepository,
} from "../../../../database";
import {
  AppTestContext,
  AppTestHelper,
  JEST_FAKE_TIMER,
} from "../../../../util/test";
import { UserStructureAuthenticated } from "../../../../_common/model";
import { generateCerfaData } from "../generate-cerfa-data";
import {
  CERFA_MOCK_USAGER_ACTIF,
  CERFA_MOCK_USAGER_REFUS,
} from "./CERFA_MOCKS.mock";
import { CerfaDocType, Structure, Usager } from "@domifa/common";
import { getUsagerRef } from "../get-usager-ref";
import { getAddress } from "../get-address";

describe("Générer les données des Cerfa", () => {
  let user: UserStructureAuthenticated;
  let usagerValide: Usager;
  let usagerRefus: Usager;
  let structure: Structure;
  let context: AppTestContext;

  afterAll(async () => {
    jest.useRealTimers();
    await AppTestHelper.tearDownTestApp(context);
  });

  beforeAll(async () => {
    context = await AppTestHelper.bootstrapTestApp({});

    //Date de référence : 22 Mars 2023
    jest
      .useFakeTimers(JEST_FAKE_TIMER)
      .setSystemTime(new Date("2023-03-22T20:45:47.433Z"));

    user = (await userStructureRepository.findOneBy({
      id: 1,
    })) as any as UserStructureAuthenticated;

    structure = await structureRepository.findOneBy({
      id: user.structureId,
    });
    user.structure = structure;

    usagerValide = await usagerRepository.getUsager(
      "97b7e840-0e93-4bf4-ba7d-0a406aa898f2"
    );

    usagerRefus = await usagerRepository.getUsager(
      "e074c416-093a-46fc-ae47-77a3bc111d35"
    );
  });

  describe("Générer les données complètes du Cerfa", () => {
    it("CerfaData() Dossier valide", () => {
      const data = generateCerfaData(
        usagerValide,
        user,
        CerfaDocType.attestation
      );
      expect(data).toEqual(CERFA_MOCK_USAGER_ACTIF);
    });

    it("CerfaData() Dossier refusé", () => {
      const data = generateCerfaData(
        usagerRefus,
        user,
        CerfaDocType.attestation
      );
      expect(data).toEqual(CERFA_MOCK_USAGER_REFUS);
    });
  });

  describe("Générer des données par défaut si elles sont vides", () => {
    it("", () => {
      usagerValide.entretien.rattachement = null;
      usagerRefus.telephone = null;
      user.structure.telephone = { countryCode: "fr", numero: "" };
      usagerRefus.telephone = { countryCode: "fr", numero: "" };
      const data = generateCerfaData(
        usagerRefus,
        user,
        CerfaDocType.attestation
      );
      expect(data.rattachement).toEqual("");
      expect(data.telephone).toEqual("");
      expect(data.telephoneOrga).toEqual("");
    });
  });

  describe("Dates de la domiciliation sur le Cerfa", () => {
    it("Dates de la précédente domiciliation pour un dossier en cours de renouvellement", () => {
      usagerValide.decision.statut = "INSTRUCTION";
      usagerValide.historique.push(usagerValide.decision);

      const data = generateCerfaData(
        usagerValide,
        user,
        CerfaDocType.attestation
      );

      expect(data.jourDebut).toEqual("12");
      expect(data.moisDebut).toEqual("02");
      expect(data.anneeDebut).toEqual("2019");
      expect(data.jourFin).toEqual("12");
      expect(data.moisFin).toEqual("02");
      expect(data.anneeFin).toEqual("2020");
    });

    it("Dates de la précédente domiciliation pour un dossier en cours de renouvellement en attente de décision", () => {
      usagerValide.decision.statut = "ATTENTE_DECISION";
      usagerValide.historique.push(usagerValide.decision);
      const data = generateCerfaData(
        usagerValide,
        user,
        CerfaDocType.attestation
      );

      expect(data.jourDebut).toEqual("12");
      expect(data.moisDebut).toEqual("02");
      expect(data.anneeDebut).toEqual("2019");
      expect(data.jourFin).toEqual("12");
      expect(data.moisFin).toEqual("02");
      expect(data.anneeFin).toEqual("2020");
    });
    it("Dates vides pour un dossier encore en cours d'instruction et sans historique", () => {
      usagerValide.decision.statut = "INSTRUCTION";
      const data = generateCerfaData(
        { ...usagerValide, historique: [] },
        user,
        CerfaDocType.attestation
      );

      expect(data.jourDebut).toEqual("");
      expect(data.moisDebut).toEqual("");
      expect(data.anneeDebut).toEqual("");
      expect(data.jourFin).toEqual("");
      expect(data.moisFin).toEqual("");
      expect(data.anneeFin).toEqual("");
    });

    it("Dates vides pour un Cerfa en attente de décision et sans historique", () => {
      usagerValide.decision.statut = "ATTENTE_DECISION";
      const data = generateCerfaData(
        { ...usagerValide, historique: [] },
        user,
        CerfaDocType.attestation
      );
      expect(data.jourDebut).toEqual("");
      expect(data.moisDebut).toEqual("");
      expect(data.anneeDebut).toEqual("");
      expect(data.jourFin).toEqual("");
      expect(data.moisFin).toEqual("");
      expect(data.anneeFin).toEqual("");
    });
  });

  describe("Générer le bon ID", () => {
    it("Aucun ID personnalisé, on affiche l'ID numérique", () => {
      const usagerRef = getUsagerRef(usagerValide);
      expect(usagerRef).toEqual("63");
    });

    it("ID personnalisé, on affiche celui-ci", () => {
      usagerValide.customRef = "toto";
      const usagerRef = getUsagerRef(usagerValide);
      expect(usagerRef).toEqual("toto");
    });
  });

  describe("Test des données liées à l'adresse ", () => {
    it("Affichage de la préfecture dans le Cerfa", () => {
      user.structure.structureType = "asso";
      const data = generateCerfaData(
        usagerValide,
        user,
        CerfaDocType.attestation
      );
      expect(data.prefecture2).toEqual("92");
      expect(data.prefecture1).toEqual("92");
    });
    it("Afficher l'ID du domicilié dans l'adresse", () => {
      user.structure.options.numeroBoite = true;
      const { adresseDomicilie } = getAddress(user, usagerValide);

      expect(adresseDomicilie).toEqual(
        "Boite toto\nCCAS de Test\n1 rue de l'océan\n92600 - Asnieres-sur-seine"
      );
      const cerfaDatas = generateCerfaData(
        usagerValide,
        user,
        CerfaDocType.attestation
      );
      expect(cerfaDatas.adresse).toEqual(
        "Boite toto\nCCAS de Test\n1 rue de l'océan\n92600 - Asnieres-sur-seine"
      );
    });

    it("Structure sans adresse de réception de courrier", () => {
      user.structure.options.numeroBoite = false;
      const { adresseDomicilie, adresseStructure } = getAddress(
        user,
        usagerValide
      );

      expect(adresseDomicilie).toEqual(
        "CCAS de Test\n1 rue de l'océan\n92600 - Asnieres-sur-seine"
      );
      expect(adresseStructure).toEqual(
        "1 rue de l'océan\n92600 - Asnieres-sur-seine"
      );
    });

    it("Structure avec adresse de réception différente", () => {
      user.structure.options.numeroBoite = false;
      user.structure.adresseCourrier = {
        adresse: "Adresse de courrier",
        ville: "Paris 10eme",
        codePostal: "75010",
        actif: true,
      };

      const { adresseDomicilie, adresseStructure } = getAddress(
        user,
        usagerValide
      );

      const cerfaDatas2 = generateCerfaData(
        usagerValide,
        user,
        CerfaDocType.attestation
      );

      expect(adresseDomicilie).toEqual(
        "CCAS de Test\nAdresse de courrier\n75010 - Paris 10eme"
      );
      expect(adresseStructure).toEqual(
        "1 rue de l'océan\n92600 - Asnieres-sur-seine"
      );

      expect(cerfaDatas2.adresse).toEqual(
        "CCAS de Test\nAdresse de courrier\n75010 - Paris 10eme"
      );
    });
    it("Usager avec numéro TSA ou boite postale", () => {
      user.structure.adresseCourrier.actif = false;
      const usagerTsa: Usager = {
        ...usagerValide,
        numeroDistribution: "TSA 30110",
      };
      const { adresseDomicilie } = getAddress(user, usagerTsa);

      const newLocal =
        "CCAS de Test\n1 rue de l'océan\nTSA 30110\n92600 - Asnieres-sur-seine";
      expect(adresseDomicilie).toEqual(newLocal);
    });

    describe("Paramètres du Cerfa : afficher ou non le surnom (utilisé pour les noms d'épouse) ", () => {
      it("Ne pas afficher le surnom si la structure ne le souhaite pas", () => {
        user.structure.options.surnom = true;
        usagerValide.surnom = null;
        const data = generateCerfaData(
          usagerValide,
          user,
          CerfaDocType.attestation
        );
        expect(data.noms1).toEqual("KARAMOKO");
      });
      it("Nom dépouse activé: ne pas afficher le surnom s'il est vide", () => {
        user.structure.options.surnom = true;
        usagerValide.surnom = null;
        const data = generateCerfaData(
          usagerValide,
          user,
          CerfaDocType.attestation
        );
        expect(data.noms1).toEqual("KARAMOKO");
      });
      it("Nom dépouse activé: afficher le surnom ", () => {
        user.structure.options.surnom = true;
        usagerValide.surnom = "Marie-madeleine";
        const data = generateCerfaData(
          usagerValide,
          user,
          CerfaDocType.attestation
        );
        expect(data.noms1).toEqual("KARAMOKO (Marie-madeleine)");
      });
    });
  });
});
