import { Test, TestingModule } from "@nestjs/testing";
import * as fs from "fs";
import * as path from "path";
import { DatabaseModule } from "../../database/database.module";
import { StructuresModule } from "../../structures/structure.module";
import { StructuresService } from "../../structures/structures.service";
import { UsersService } from "../../users/services/users.service";
import { UsersModule } from "../../users/users.module";
import { UsersProviders } from "../../users/users.providers";
import { UsagersModule } from "../usagers.module";
import { UsagersProviders } from "../usagers.providers";
import { CerfaService } from "./cerfa.service";
import { UsagersService } from "./usagers.service";

describe("CerfaService", () => {
  let service: CerfaService;
  let usagerService: UsagersService;
  let userService: UsersService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [DatabaseModule, UsersModule, UsagersModule, StructuresModule],
      providers: [
        CerfaService,
        UsersService,
        UsagersService,
        ...UsagersProviders,
        ...UsersProviders
      ]
    }).compile();

    service = module.get<CerfaService>(CerfaService);
    usagerService = module.get<UsagersService>(UsagersService);
    userService = module.get<UsersService>(UsersService);
  });

  it("0. Init + variables", () => {
    expect(service).toBeDefined();

    expect(service.convertDate(null)).toEqual({
      annee: "",
      hours: "",
      jour: "",
      minutes: "",
      mois: ""
    });
  });

  it("1. Load PDF demande", () => {
    const pdfForm1 = "../../ressources/demande.pdf";
    expect(fs.existsSync(path.resolve(__dirname, pdfForm1))).toBe(true);

    const pdfForm2 = "../../ressources/attestation.pdf";
    expect(fs.existsSync(path.resolve(__dirname, pdfForm2))).toBe(true);
  });

  it("3. Attestation de DEMANDE ⏳", async () => {
    const user = await userService.findOne({ id: 1 });
    const usager = await usagerService.findById(5, user.structureId);
    const datasAttendues = {
      "topmostSubform[0].Page1[0].AdressePostale[0]":
        "1 place de l'hôtel de ville, , Asnieres-sur-seine, 92600",
      "topmostSubform[0].Page1[0].Annéeconvocation[0]": "2019",
      "topmostSubform[0].Page1[0].AyantsDroits[0]":
        "Inspecteur Gadget né(e) le 12/10/1990 - ",
      "topmostSubform[0].Page1[0].Courriel[0]": "",
      "topmostSubform[0].Page1[0].Courriel[1]": "ccastest@yopmail.com",
      "topmostSubform[0].Page1[0].Datenaissance1[0]": "24",
      "topmostSubform[0].Page1[0].Datenaissance2[0]": "05",
      "topmostSubform[0].Page1[0].Datenaissance3[0]": "1911",
      "topmostSubform[0].Page1[0].EntretienAdresse[0]":
        "1 place de l'hôtel de ville, , Asnieres-sur-seine, 92600",
      "topmostSubform[0].Page1[0].EntretienAvec[0]": "Juste Isabelle",
      "topmostSubform[0].Page1[0].FaitLeDemandeur1[0]": "07",
      "topmostSubform[0].Page1[0].FaitLeDemandeur2[0]": "10",
      "topmostSubform[0].Page1[0].FaitLeDemandeur3[0]": "2019",
      "topmostSubform[0].Page1[0].FaitLeOrganisme1[0]": "07",
      "topmostSubform[0].Page1[0].FaitLeOrganisme2[0]": "10",
      "topmostSubform[0].Page1[0].FaitLeOrganisme3[0]": "2019",
      "topmostSubform[0].Page1[0].Groupe_de_boutons_radio[0]": "1",
      "topmostSubform[0].Page1[0].Heureconvocation[0]": "21",
      "topmostSubform[0].Page1[0].Jourconvocation[0]": "07",
      "topmostSubform[0].Page1[0].LieuNaissance[0]": "BERGERAC",
      "topmostSubform[0].Page1[0].LieuNaissance[1]": "BERGERAC",
      "topmostSubform[0].Page1[0].Minuteconvocation[0]": "30",
      "topmostSubform[0].Page1[0].Mme-Monsieur1[0]": "2",
      "topmostSubform[0].Page1[0].Moisconvocation[0]": "10",
      "topmostSubform[0].Page1[0].Nomdelorganisme[0]": "CCAS de test",
      "topmostSubform[0].Page1[0].Noms[0]": "DERICK",
      "topmostSubform[0].Page1[0].NumAgrement[0]": "",
      "topmostSubform[0].Page1[0].PréfectureayantDélivré[0]": "",
      "topmostSubform[0].Page1[0].Prénoms[0]": "INSPECTEUR",
      "topmostSubform[0].Page1[0].téléphone[0]": "",
      "topmostSubform[0].Page1[0].téléphone[1]": "0101010101",
      "topmostSubform[0].Page2[0].AnnéeNaissanceDemandeur[0]": "1911",
      "topmostSubform[0].Page2[0].JourNaissanceDemandeur[0]": "24",
      "topmostSubform[0].Page2[0].LieuNaissanceDemandeur[0]": "BERGERAC",
      "topmostSubform[0].Page2[0].Mme-Monsieur2[0]": "2",
      "topmostSubform[0].Page2[0].MoisNaissanceDemandeur[0]": "05",
      "topmostSubform[0].Page2[0].NomOrgaDomiciliataire[0]": "CCAS de test",
      "topmostSubform[0].Page2[0].NomsDemandeur[0]": "DERICK",
      "topmostSubform[0].Page2[0].NuméroAgrément[0]": "",
      "topmostSubform[0].Page2[0].PrefectureDelivrAgrément[0]": "",
      "topmostSubform[0].Page2[0].PrénomsDemandeur[0]": "INSPECTEUR"
    };

    expect(usager).toBeDefined();
    expect(user).toBeDefined();

    service.attestation(usager, user);
    expect(service.sexe).toEqual("2");
    expect(service.pdfForm).toEqual("../../ressources/demande.pdf");
    expect(await service.infosPdf).toEqual(datasAttendues);
  });

  it("4. Attestation de DOMICILIATION ✅", async () => {
    const user = await userService.findOne({ id: 1 });
    const usager = await usagerService.findById(2, user.structureId);

    expect(usager).toBeDefined();
    expect(user).toBeDefined();
    expect(service.convertDate(null)).toEqual({
      annee: "",
      hours: "",
      jour: "",
      minutes: "",
      mois: ""
    });

    service.attestation(usager, user);
    expect(service.motif).toEqual("");
    expect(service.sexe).toEqual("2");

    const datasAttendues = {
      "topmostSubform[0].Page1[0].AdressePostaleOrganisme[0]":
        "CCAS de test\n1 place de l'hôtel de ville, Asnieres-sur-seine, 92600",
      "topmostSubform[0].Page1[0].AdressePostale[0]":
        "CCAS de test\n1 place de l'hôtel de ville, Asnieres-sur-seine, 92600",
      "topmostSubform[0].Page1[0].AnneePremiereDomic[0]": "2018",
      "topmostSubform[0].Page1[0].AnnéeValidité1[0]": "2019",
      "topmostSubform[0].Page1[0].AnnéeValidité2[0]": "2020",
      "topmostSubform[0].Page1[0].AyantsDroits[0]":
        "Karamoko Mauricette né(e) le 20/12/1978 - ",
      "topmostSubform[0].Page1[0].Courriel[0]": "ccastest@yopmail.com",
      "topmostSubform[0].Page1[0].Datenaissance1[0]": "07",
      "topmostSubform[0].Page1[0].Datenaissance2[0]": "08",
      "topmostSubform[0].Page1[0].Datenaissance3[0]": "1998",
      "topmostSubform[0].Page1[0].JourPremiereDomic[0]": "11",
      "topmostSubform[0].Page1[0].JourValidité1[0]": "12",
      "topmostSubform[0].Page1[0].JourValidité2[0]": "12",
      "topmostSubform[0].Page1[0].LieuNaissance[0]": "BOUAKÉ, CÔTE D'IVOIRE",
      "topmostSubform[0].Page1[0].Mme-Monsieur1[0]": "2",
      "topmostSubform[0].Page1[0].MoisPremiereDomic[0]": "01",
      "topmostSubform[0].Page1[0].MoisValidité1[0]": "02",
      "topmostSubform[0].Page1[0].MoisValidité2[0]": "02",
      "topmostSubform[0].Page1[0].Nomdelorganisme[0]": "CCAS de test",
      "topmostSubform[0].Page1[0].Noms2[0]": "KARAMOKO",
      "topmostSubform[0].Page1[0].Noms[0]": "KARAMOKO",
      "topmostSubform[0].Page1[0].NumAgrement[0]": "",
      "topmostSubform[0].Page1[0].PréfectureayantDélivré[0]": "",
      "topmostSubform[0].Page1[0].Prénoms2[0]": "MAURICE",
      "topmostSubform[0].Page1[0].Prénoms[0]": "MAURICE",
      "topmostSubform[0].Page1[0].RespOrganisme[0]": "Romero Patrick",
      "topmostSubform[0].Page1[0].téléphone[0]": "0101010101",
      "topmostSubform[0].Page2[0].NomOrgaDomiciliataire[0]": "CCAS de test",
      "topmostSubform[0].Page2[0].NuméroAgrément[0]": "",
      "topmostSubform[0].Page2[0].PrefectureDelivrAgrément[0]": ""
    };
    expect(await service.infosPdf).toEqual(datasAttendues);
  });

  it("5. Attestation de REFUS 🚫", async () => {
    const user = await userService.findOne({ id: 1 });
    const usager = await usagerService.findById(3, user.structureId);

    expect(usager).toBeDefined();
    expect(user).toBeDefined();

    service.attestation(usager, user);
    const datasAttendues = {
      "topmostSubform[0].Page1[0].AdressePostale[0]":
        "1 place de l'hôtel de ville, , Asnieres-sur-seine, 92600",
      "topmostSubform[0].Page1[0].Annéeconvocation[0]": "",
      "topmostSubform[0].Page1[0].AyantsDroits[0]": "",
      "topmostSubform[0].Page1[0].Courriel[0]": "",
      "topmostSubform[0].Page1[0].Courriel[1]": "ccastest@yopmail.com",
      "topmostSubform[0].Page1[0].Datenaissance1[0]": "07",
      "topmostSubform[0].Page1[0].Datenaissance2[0]": "08",
      "topmostSubform[0].Page1[0].Datenaissance3[0]": "1940",
      "topmostSubform[0].Page1[0].EntretienAdresse[0]":
        "1 place de l'hôtel de ville, , Asnieres-sur-seine, 92600",
      "topmostSubform[0].Page1[0].EntretienAvec[0]": "",
      "topmostSubform[0].Page1[0].FaitLeDemandeur1[0]": "12",
      "topmostSubform[0].Page1[0].FaitLeDemandeur2[0]": "09",
      "topmostSubform[0].Page1[0].FaitLeDemandeur3[0]": "2019",
      "topmostSubform[0].Page1[0].FaitLeOrganisme1[0]": "12",
      "topmostSubform[0].Page1[0].FaitLeOrganisme2[0]": "09",
      "topmostSubform[0].Page1[0].FaitLeOrganisme3[0]": "2019",
      "topmostSubform[0].Page1[0].Groupe_de_boutons_radio[0]": "1",
      "topmostSubform[0].Page1[0].Heureconvocation[0]": "",
      "topmostSubform[0].Page1[0].Jourconvocation[0]": "",
      "topmostSubform[0].Page1[0].LieuNaissance[0]": "MACON",
      "topmostSubform[0].Page1[0].LieuNaissance[1]": "MACON",
      "topmostSubform[0].Page1[0].Minuteconvocation[0]": "",
      "topmostSubform[0].Page1[0].Mme-Monsieur1[0]": "2",
      "topmostSubform[0].Page1[0].Moisconvocation[0]": "",
      "topmostSubform[0].Page1[0].Nomdelorganisme[0]": "CCAS de test",
      "topmostSubform[0].Page1[0].Noms[0]": "DUPONT",
      "topmostSubform[0].Page1[0].NumAgrement[0]": "",
      "topmostSubform[0].Page1[0].PréfectureayantDélivré[0]": "",
      "topmostSubform[0].Page1[0].Prénoms[0]": "FRED",
      "topmostSubform[0].Page1[0].téléphone[0]": "",
      "topmostSubform[0].Page1[0].téléphone[1]": "0101010101",
      "topmostSubform[0].Page2[0].AnnéeNaissanceDemandeur[0]": "1940",
      "topmostSubform[0].Page2[0].Décision[0]": "2",
      "topmostSubform[0].Page2[0].JourNaissanceDemandeur[0]": "07",
      "topmostSubform[0].Page2[0].LieuNaissanceDemandeur[0]": "MACON",
      "topmostSubform[0].Page2[0].Mme-Monsieur2[0]": "2",
      "topmostSubform[0].Page2[0].MoisNaissanceDemandeur[0]": "08",
      "topmostSubform[0].Page2[0].MotifRefus[0]":
        "Nombre maximal domiciliations atteint",
      "topmostSubform[0].Page2[0].NomOrgaDomiciliataire[0]": "CCAS de test",
      "topmostSubform[0].Page2[0].NomsDemandeur[0]": "DUPONT",
      "topmostSubform[0].Page2[0].NuméroAgrément[0]": "",
      "topmostSubform[0].Page2[0].OrientationProposée[0]": "",
      "topmostSubform[0].Page2[0].PrefectureDelivrAgrément[0]": "",
      "topmostSubform[0].Page2[0].PrénomsDemandeur[0]": "FRED"
    };

    expect(service.sexe).toEqual("2");
    expect(service.pdfForm).toEqual("../../ressources/demande.pdf");

    expect(await service.infosPdf).toEqual(datasAttendues);

    expect(usager.decision.motif).toEqual("SATURATION");
    expect(usager.decision.motifDetails).toEqual("");
    service.attestation(usager, user);
    expect(service.motif).toEqual("Nombre maximal domiciliations atteint");
  });
});
