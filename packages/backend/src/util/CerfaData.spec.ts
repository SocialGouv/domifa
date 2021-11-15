import {
  usagerRepository,
  userStructureRepository,
  structureRepository,
} from "../database";
import { UsagersModule } from "../usagers/usagers.module";
import { UsersModule } from "../users/users.module";
import { AppTestContext, AppTestHelper } from "../util/test";
import { Usager, UserStructureAuthenticated } from "../_common/model";
import { getUsagerRef, CerfaData } from "./CerfaData";

const mockData = {
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
  ayantsDroits: "Karamoko Mauricette né(e) le 20/12/1978 - ",
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
  prefecture1: "92",
  prefecture2: "92",
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

describe("Cerfa Data utils", () => {
  let context: AppTestContext;
  let user: UserStructureAuthenticated;
  let usager: Usager;
  let structure;

  beforeAll(async () => {
    context = await AppTestHelper.bootstrapTestApp({
      imports: [UsagersModule, UsersModule],
    });
    user = await userStructureRepository.findOne({ id: 1 });
    usager = await usagerRepository.findOne({
      ref: 2,
      structureId: 1,
    });
    structure = await structureRepository.findOne({
      id: 1,
    });
    user.structure = structure;
  });

  it("getUsagerRef() should return ref in string", () => {
    const usagerRef = getUsagerRef(usager);

    expect(usagerRef).toEqual("63");
  });

  it("getUsagerRef() should return customRef if it's not nil", () => {
    usager.customRef = "toto";
    const usagerRef = getUsagerRef(usager);

    expect(usagerRef).toEqual("toto");
  });

  it("CerfaData() should format data", () => {
    const data = CerfaData(usager, user);

    expect(data).toEqual(mockData);
  });
});
