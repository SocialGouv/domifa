import {
  userStructureRepository,
  structureRepository,
  usagerRepository,
} from "../../../../database";
import { UsersModule } from "../../../../users/users.module";
import { AppTestContext, AppTestHelper } from "../../../../util/test";
import {
  UserStructureAuthenticated,
  Usager,
  Structure,
} from "../../../../_common/model";
import { UsagersModule } from "../../../usagers.module";
import {
  getUsagerRef,
  generateCerfaDatas,
} from "../generateCerfaDatas.service";

const mockDataUsagerValide = {
  adresse: "CCAS de Test\n1 rue de l'océan\n92600 - Asnieres-sur-seine",
  adresseOrga1: "CCAS de Test\n1 rue de l'océan\n92600 - Asnieres-sur-seine",
  agrement: null,
  anneeDebut: "2019",
  anneeDecision1A: "2019",
  anneeDecision1B: "2019",
  anneeDecision2: "2019",
  anneeFin: "2020",
  anneeNaissance1: "1998",
  anneeNaissance2: "1998",
  anneePremiereDom: "2018",
  anneeRdv: "",
  ayantsDroits: "Karamoko Mauricette né(e) le 20/12/1978",
  courriel: "domicilie2@yopmail.com",
  courrielOrga: "ccas.test@yopmail.com",
  decision: "",
  entretienAdresse:
    "CCAS de Test\n1 rue de l'océan\n92600 - Asnieres-sur-seine",
  entretienAvec: "",
  heureRdv: "",
  jourDebut: "12",
  jourDecision1A: "12",
  jourDecision1B: "12",
  jourDecision2: "12",
  jourFin: "12",
  jourNaissance1: "07",
  jourNaissance2: "07",
  jourPremiereDom: "11",
  jourRdv: "",
  lieuNaissance1: "BOUAKÉ, CÔTE D'IVOIRE",
  lieuNaissance2: "BOUAKÉ, CÔTE D'IVOIRE",
  minutesRdv: "",
  moisDebut: "02",
  moisDecision1A: "02",
  moisDecision1B: "02",
  moisDecision2: "02",
  moisFin: "02",
  moisNaissance1: "08",
  moisNaissance2: "08",
  moisPremiereDom: "01",
  moisRdv: "",
  motifRefus: "",
  nomOrga1: "CCAS DE TEST",
  nomOrga2: "CCAS DE TEST",
  noms1: "KARAMOKO",
  noms2: "KARAMOKO",
  numeroUsager: "toto",
  orientation: "",
  prefecture1: "",
  prefecture2: "",
  prenoms1: "MAURICE",
  prenoms2: "MAURICE",
  rattachement: "",
  responsable: "JEAN, THOMSON, PDG",
  sexe1: "2",
  sexe2: "2",
  signature1A: "ASNIERES-SUR-SEINE",
  signature1B: "ASNIERES-SUR-SEINE",
  signature2: "ASNIERES-SUR-SEINE",
  telephone: "0142424242",
  telephoneOrga: "0602030405",
  typeDemande: "2",
};

const mockDataUsagerRefus = {
  adresse: "CCAS de Test\n1 rue de l'océan\n92600 - Asnieres-sur-seine",
  adresseOrga1: "CCAS de Test\n1 rue de l'océan\n92600 - Asnieres-sur-seine",
  agrement: null,
  anneeDebut: "2019",
  anneeDecision1A: "2019",
  anneeDecision1B: "2019",
  anneeDecision2: "2019",
  anneeFin: "2020",
  anneeNaissance1: "1940",
  anneeNaissance2: "1940",
  anneePremiereDom: "2019",
  anneeRdv: "",
  ayantsDroits: "",
  courriel: "",
  courrielOrga: "ccas.test@yopmail.com",
  decision: "2",
  entretienAdresse:
    "CCAS de Test\n1 rue de l'océan\n92600 - Asnieres-sur-seine",
  entretienAvec: "",
  heureRdv: "",
  jourDebut: "12",
  jourDecision1A: "12",
  jourDecision1B: "12",
  jourDecision2: "12",
  jourFin: "09",
  jourNaissance1: "07",
  jourNaissance2: "07",
  jourPremiereDom: "07",
  jourRdv: "",
  lieuNaissance1: "MACON",
  lieuNaissance2: "MACON",
  minutesRdv: "",
  moisDebut: "09",
  moisDecision1A: "09",
  moisDecision1B: "09",
  moisDecision2: "09",
  moisFin: "08",
  moisNaissance1: "08",
  moisNaissance2: "08",
  moisPremiereDom: "10",
  moisRdv: "",
  motifRefus: "Nombre maximal domiciliations atteint",
  nomOrga1: "CCAS DE TEST",
  nomOrga2: "CCAS DE TEST",
  noms1: "DUPONT",
  noms2: "DUPONT",
  numeroUsager: "3",
  orientation: "",
  prefecture1: "",
  prefecture2: "",
  prenoms1: "FRED",
  prenoms2: "FRED",
  rattachement: "",
  responsable: "JEAN, THOMSON, PDG",
  sexe1: "2",
  sexe2: "2",
  signature1A: "ASNIERES-SUR-SEINE",
  signature1B: "ASNIERES-SUR-SEINE",
  signature2: "ASNIERES-SUR-SEINE",
  telephone: "",
  telephoneOrga: "0602030405",
  typeDemande: "1",
};

describe("Cerfa Data utils", () => {
  let context: AppTestContext;
  let user: UserStructureAuthenticated;
  let usagerValide: Usager;
  let usagerRefus: Usager;
  let structure: Structure;

  beforeAll(async () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    context = await AppTestHelper.bootstrapTestApp({
      imports: [UsagersModule, UsersModule],
    });
    user = await userStructureRepository.findOne({ id: 1 });
    structure = await structureRepository.findOne({
      id: 1,
    });
    user.structure = structure;

    // Usagers à tester
    usagerValide = await usagerRepository.findOne({
      ref: 2,
      structureId: 1,
    });
    usagerRefus = await usagerRepository.findOne({
      ref: 3,
      structureId: 1,
    });
  });

  it("getUsagerRef() should return ref in string", () => {
    const usagerRef = getUsagerRef(usagerValide);

    expect(usagerRef).toEqual("63");
  });

  it("getUsagerRef() should return customRef if it's not nil", () => {
    usagerValide.customRef = "toto";
    const usagerRef = getUsagerRef(usagerValide);

    expect(usagerRef).toEqual("toto");
  });

  it("CerfaData() Dossier valide", async () => {
    const data = generateCerfaDatas(usagerValide, user, "attestation");
    expect(data).toEqual(mockDataUsagerValide);
  });

  it("CerfaData() Dossier refusé", async () => {
    const data = generateCerfaDatas(usagerRefus, user, "attestation");
    expect(data).toEqual(mockDataUsagerRefus);
  });

  it("CerfaData() test de valeurs vides", async () => {
    usagerValide.entretien.rattachement = null;
    usagerRefus.phone = null;
    user.structure.telephone = { countryCode: "fr", numero: "" };
    const data = generateCerfaDatas(usagerRefus, user, "attestation");
    expect(data.rattachement).toEqual("");
    expect(data.telephone).toEqual("");
    expect(data.telephoneOrga).toEqual("");
  });

  it("CerfaData() Tests de cas particuliers", async () => {
    user.structure.options.numeroBoite = true;
    const cerfaDatas = generateCerfaDatas(usagerValide, user, "attestation");
    expect(cerfaDatas.adresse).toEqual(
      "Boite toto\nCCAS de Test\n1 rue de l'océan\n92600 - Asnieres-sur-seine"
    );

    user.structure.adresseCourrier = {
      adresse: "Adresse de courrier",
      ville: "Paris 10eme",
      codePostal: "75010",
      actif: true,
    };

    const cerfaDatas2 = generateCerfaDatas(usagerValide, user, "attestation");
    expect(cerfaDatas2.adresse).toEqual(
      "Boite toto\nCCAS de Test\nAdresse de courrier\n75010 - Paris 10eme"
    );
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
