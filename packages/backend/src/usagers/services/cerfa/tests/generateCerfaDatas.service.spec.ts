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
import {
  UserStructureAuthenticated,
  Usager,
  Structure,
} from "../../../../_common/model";
import {
  generateCerfaDatas,
  getUsagerRef,
  generateAdressForCerfa,
} from "../generateCerfaDatas.service";
import {
  CERFA_MOCK_USAGER_ACTIF,
  CERFA_MOCK_USAGER_REFUS,
} from "./CERFA_MOCKS.mock";

describe("Cerfa Data utils", () => {
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
      id: 1,
    });
    user.structure = structure;

    // Usagers à tester
    usagerValide = await usagerRepository.getUsager(
      "97b7e840-0e93-4bf4-ba7d-0a406aa898f2"
    );

    usagerRefus = await usagerRepository.getUsager(
      "e074c416-093a-46fc-ae47-77a3bc111d35"
    );
  });

  describe("Cerfa : générer les données complètes du Cerfa", () => {
    it("CerfaData() Dossier valide", async () => {
      const data = generateCerfaDatas(usagerValide, user, "attestation");
      expect(data).toEqual(CERFA_MOCK_USAGER_ACTIF);
    });

    it("CerfaData() Dossier refusé", async () => {
      const data = generateCerfaDatas(usagerRefus, user, "attestation");
      expect(data).toEqual(CERFA_MOCK_USAGER_REFUS);
    });

    it("CerfaData() test de valeurs vides", async () => {
      usagerValide.entretien.rattachement = null;
      usagerRefus.telephone = null;
      user.structure.telephone = { countryCode: "fr", numero: "" };
      usagerRefus.telephone = { countryCode: "fr", numero: "" };
      const data = generateCerfaDatas(usagerRefus, user, "attestation");
      expect(data.rattachement).toEqual("");
      expect(data.telephone).toEqual("");
      expect(data.telephoneOrga).toEqual("");
    });

    it("CerfaData() si dossier est en INSTRUCTION alors dateDebut et dateFin doivent être vide", async () => {
      usagerValide.decision.statut = "INSTRUCTION";
      const data = generateCerfaDatas(usagerValide, user, "attestation");

      expect(data.jourDebut).toEqual("");
      expect(data.moisDebut).toEqual("");
      expect(data.anneeDebut).toEqual("");
      expect(data.jourFin).toEqual("");
      expect(data.moisFin).toEqual("");
      expect(data.anneeFin).toEqual("");
    });

    it("CerfaData() si dossier est en ATTENTE_DECISION alors dateDebut et dateFin doivent être vide", async () => {
      usagerValide.decision.statut = "ATTENTE_DECISION";
      const data = generateCerfaDatas(usagerValide, user, "attestation");

      expect(data.jourDebut).toEqual("");
      expect(data.moisDebut).toEqual("");
      expect(data.anneeDebut).toEqual("");
      expect(data.jourFin).toEqual("");
      expect(data.moisFin).toEqual("");
      expect(data.anneeFin).toEqual("");
    });

    it("CerfaData() si dossier est en ATTENTE_DECISION alors dateDebut et dateFin doivent être vide", async () => {
      usagerValide.decision.statut = "ATTENTE_DECISION";
      user.structure.structureType = "asso";
      const data = generateCerfaDatas(usagerValide, user, "attestation");

      expect(data.prefecture2).toEqual("92");
      expect(data.prefecture1).toEqual("92");
    });
  });

  describe("Cerfa : getUsagerRef", () => {
    it("getUsagerRef() should return ref in string", () => {
      const usagerRef = getUsagerRef(usagerValide);
      expect(usagerRef).toEqual("63");
    });

    it("getUsagerRef() should return customRef if it's not nil", () => {
      usagerValide.customRef = "toto";
      const usagerRef = getUsagerRef(usagerValide);
      expect(usagerRef).toEqual("toto");
    });
  });

  describe("generateAdressForCerfa", () => {
    it("Afficher l'ID du domicilié dans l'adresse", () => {
      user.structure.options.numeroBoite = true;
      const { adresseDomicilie } = generateAdressForCerfa(user, usagerValide);

      expect(adresseDomicilie).toEqual(
        "Boite toto\nCCAS de Test\n1 rue de l'océan\n92600 - Asnieres-sur-seine"
      );
      const cerfaDatas = generateCerfaDatas(usagerValide, user, "attestation");
      expect(cerfaDatas.adresse).toEqual(
        "Boite toto\nCCAS de Test\n1 rue de l'océan\n92600 - Asnieres-sur-seine"
      );
    });

    it("Structure sans adresse de réception de courrier", () => {
      user.structure.options.numeroBoite = false;
      const { adresseDomicilie, adresseStructure } = generateAdressForCerfa(
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

      const { adresseDomicilie, adresseStructure } = generateAdressForCerfa(
        user,
        usagerValide
      );

      const cerfaDatas2 = generateCerfaDatas(usagerValide, user, "attestation");

      expect(adresseDomicilie).toEqual(
        "CCAS de Test\nAdresse de courrier\n75010 - Paris 10eme"
      );
      // Ici, l'adresse de la structure ne doit pas changer
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
      const { adresseDomicilie } = generateAdressForCerfa(user, usagerTsa);

      expect(adresseDomicilie).toEqual(
        `CCAS de Test\n1 rue de l'océan\nTSA 30110\n92600 - Asnieres-sur-seine`
      );
    });
  });
});
