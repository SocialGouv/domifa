import { Test, TestingModule } from "@nestjs/testing";
import * as fs from "fs";
import * as mongoose from "mongoose";
import pdftk = require("node-pdftk");
import * as path from "path";
import { DatabaseModule } from "../../database/database.module";
import { StructuresModule } from "../../structures/structure.module";
import { StructuresService } from "../../structures/structures.service";
import { UsersModule } from "../../users/users.module";
import { UsersProviders } from "../../users/users.providers";
import { UsersService } from "../../users/users.service";
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
        { provide: CerfaService, useValue: {} },
        { provide: UsersService, useValue: {} },
        { provide: UsagersService, useValue: {} },
        {
          provide: StructuresService,
          useValue: {}
        },
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
    const usager = await usagerService.findById(6);
    const user = await userService.findById(1);
    const datasAttendues = {
      "topmostSubform[0].Page1[0].AyantsDroits[0]":
        "Mordic Martin né(e) le 12/09/2009 - Raphael Mordi né(e) le 20/02/2004 - ",
      "topmostSubform[0].Page1[0].Datenaissance1[0]": "08",
      "topmostSubform[0].Page1[0].Datenaissance2[0]": "12",
      "topmostSubform[0].Page1[0].Datenaissance3[0]": "1980",
      "topmostSubform[0].Page1[0].LieuNaissance[0]": "ECOUEN EZANVILLE",
      "topmostSubform[0].Page1[0].Mme-Monsieur1[0]": "1",
      "topmostSubform[0].Page1[0].Noms[0]": "RAMZI",
      "topmostSubform[0].Page1[0].Prénoms[0]": "DEBARD",
      "topmostSubform[0].Page2[0].NomOrgaDomiciliataire[0]":
        "Association ARCAT",
      "topmostSubform[0].Page2[0].NuméroAgrément[0]": "1000900293",
      "topmostSubform[0].Page2[0].PrefectureDelivrAgrément[0]": "Paris, 75",
      "topmostSubform[0].Page1[0].téléphone[0]": "0606060606",
      "topmostSubform[0].Page1[0].Courriel[0]": "",
      "topmostSubform[0].Page1[0].Groupe_de_boutons_radio[0]": "1",
      "topmostSubform[0].Page1[0].LieuNaissance[1]": "ECOUEN EZANVILLE",
      "topmostSubform[0].Page2[0].Mme-Monsieur2[0]": "1",
      "topmostSubform[0].Page2[0].NomsDemandeur[0]": "RAMZI",
      "topmostSubform[0].Page2[0].PrénomsDemandeur[0]": "DEBARD",
      "topmostSubform[0].Page2[0].JourNaissanceDemandeur[0]": "08",
      "topmostSubform[0].Page2[0].MoisNaissanceDemandeur[0]": "12",
      "topmostSubform[0].Page2[0].AnnéeNaissanceDemandeur[0]": "1980",
      "topmostSubform[0].Page2[0].LieuNaissanceDemandeur[0]":
        "ECOUEN EZANVILLE",
      "topmostSubform[0].Page1[0].FaitLeOrganisme1[0]": "03",
      "topmostSubform[0].Page1[0].FaitLeOrganisme2[0]": "07",
      "topmostSubform[0].Page1[0].FaitLeOrganisme3[0]": "2019",
      "topmostSubform[0].Page1[0].FaitLeDemandeur1[0]": "03",
      "topmostSubform[0].Page1[0].FaitLeDemandeur2[0]": "07",
      "topmostSubform[0].Page1[0].FaitLeDemandeur3[0]": "2019",
      "topmostSubform[0].Page1[0].Jourconvocation[0]": "11",
      "topmostSubform[0].Page1[0].Moisconvocation[0]": "07",
      "topmostSubform[0].Page1[0].Annéeconvocation[0]": "2019",
      "topmostSubform[0].Page1[0].Heureconvocation[0]": "10",
      "topmostSubform[0].Page1[0].Minuteconvocation[0]": "20",
      "topmostSubform[0].Page1[0].Nomdelorganisme[0]": "Association ARCAT",
      "topmostSubform[0].Page1[0].PréfectureayantDélivré[0]": "Paris, 75",
      "topmostSubform[0].Page1[0].NumAgrement[0]": "1000900293",
      "topmostSubform[0].Page1[0].AdressePostale[0]":
        "14 rue de Buzenval, CHRS, bleu, Paris, 75014",
      "topmostSubform[0].Page1[0].Courriel[1]": "marko@yopmail.com",
      "topmostSubform[0].Page1[0].téléphone[1]": "0148252303",
      "topmostSubform[0].Page1[0].EntretienAvec[0]": "Anguet Anaïs",
      "topmostSubform[0].Page1[0].EntretienAdresse[0]":
        "14 rue de Buzenval, CHRS, bleu, Paris, 75014"
    };

    expect(usager).toBeDefined();
    expect(user).toBeDefined();

    service.attestation(usager, user);
    expect(service.sexe).toEqual("1");
    expect(service.pdfForm).toEqual("../../ressources/demande.pdf");
    expect(await service.infosPdf).toEqual(datasAttendues);
  });

  it("4. Attestation de DOMICILIATION ✅", async () => {
    const usager = await usagerService.findById(2);
    const user = await userService.findById(1);

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
    expect(service.motifRefus).toEqual("");
    expect(service.sexe).toEqual("2");

    const datasAttendues = {
      "topmostSubform[0].Page1[0].AyantsDroits[0]": "",
      "topmostSubform[0].Page1[0].Datenaissance1[0]": "12",
      "topmostSubform[0].Page1[0].Datenaissance2[0]": "12",
      "topmostSubform[0].Page1[0].Datenaissance3[0]": "1991",
      "topmostSubform[0].Page1[0].LieuNaissance[0]": "PARIS",
      "topmostSubform[0].Page1[0].Mme-Monsieur1[0]": "2",
      "topmostSubform[0].Page1[0].Noms[0]": "SAMIR",
      "topmostSubform[0].Page1[0].Prénoms[0]": "BAM",
      "topmostSubform[0].Page2[0].NomOrgaDomiciliataire[0]":
        "Association ARCAT",
      "topmostSubform[0].Page2[0].NuméroAgrément[0]": "1000900293",
      "topmostSubform[0].Page2[0].PrefectureDelivrAgrément[0]": "Paris, 75",
      "topmostSubform[0].Page1[0].Nomdelorganisme[0]": "Association ARCAT",
      "topmostSubform[0].Page1[0].RespOrganisme[0]": "Jean-Michel Marin",
      "topmostSubform[0].Page1[0].PréfectureayantDélivré[0]": "Paris, 75",
      "topmostSubform[0].Page1[0].NumAgrement[0]": "1000900293",
      "topmostSubform[0].Page1[0].AdressePostaleOrganisme[0]":
        "14 rue de Buzenval, CHRS, bleu, Paris, 75014",
      "topmostSubform[0].Page1[0].Courriel[0]": "marko@yopmail.com",
      "topmostSubform[0].Page1[0].téléphone[0]": "0148252303",
      "topmostSubform[0].Page1[0].Noms2[0]": "SAMIR",
      "topmostSubform[0].Page1[0].Prénoms2[0]": "BAM",
      "topmostSubform[0].Page1[0].AdressePostale[0]":
        "14 rue de Buzenval, CHRS, bleu, Paris, 75014"
    };
    expect(await service.infosPdf).toEqual(datasAttendues);
  });

  it("5. Attestation de REFUS 🚫", async () => {
    const usager = await usagerService.findById(3);
    const user = await userService.findById(1);

    expect(usager).toBeDefined();
    expect(user).toBeDefined();

    usager.decision.motifDetails = "TEST";

    service.attestation(usager, user);
    expect(service.motifRefus).toEqual(
      "Absence de lien avec la commune (CCAS/commune) : TEST"
    );

    const datasAttendues = {
      "topmostSubform[0].Page1[0].AyantsDroits[0]": "",
      "topmostSubform[0].Page1[0].Datenaissance1[0]": "12",
      "topmostSubform[0].Page1[0].Datenaissance2[0]": "06",
      "topmostSubform[0].Page1[0].Datenaissance3[0]": "1950",
      "topmostSubform[0].Page1[0].LieuNaissance[0]": "BRATISLAVA",
      "topmostSubform[0].Page1[0].Mme-Monsieur1[0]": "2",
      "topmostSubform[0].Page1[0].Noms[0]": "MICHEL",
      "topmostSubform[0].Page1[0].Prénoms[0]": "BOUGIE",
      "topmostSubform[0].Page2[0].NomOrgaDomiciliataire[0]":
        "Association ARCAT",
      "topmostSubform[0].Page2[0].NuméroAgrément[0]": "1000900293",
      "topmostSubform[0].Page2[0].PrefectureDelivrAgrément[0]": "Paris, 75",
      "topmostSubform[0].Page1[0].téléphone[0]": "0606060606",
      "topmostSubform[0].Page1[0].Courriel[0]": "",
      "topmostSubform[0].Page1[0].Groupe_de_boutons_radio[0]": "1",
      "topmostSubform[0].Page1[0].LieuNaissance[1]": "BRATISLAVA",
      "topmostSubform[0].Page2[0].Mme-Monsieur2[0]": "2",
      "topmostSubform[0].Page2[0].NomsDemandeur[0]": "MICHEL",
      "topmostSubform[0].Page2[0].PrénomsDemandeur[0]": "BOUGIE",
      "topmostSubform[0].Page2[0].JourNaissanceDemandeur[0]": "12",
      "topmostSubform[0].Page2[0].MoisNaissanceDemandeur[0]": "06",
      "topmostSubform[0].Page2[0].AnnéeNaissanceDemandeur[0]": "1950",
      "topmostSubform[0].Page2[0].LieuNaissanceDemandeur[0]": "BRATISLAVA",
      "topmostSubform[0].Page1[0].FaitLeOrganisme1[0]": "03",
      "topmostSubform[0].Page1[0].FaitLeOrganisme2[0]": "07",
      "topmostSubform[0].Page1[0].FaitLeOrganisme3[0]": "2019",
      "topmostSubform[0].Page1[0].FaitLeDemandeur1[0]": "03",
      "topmostSubform[0].Page1[0].FaitLeDemandeur2[0]": "07",
      "topmostSubform[0].Page1[0].FaitLeDemandeur3[0]": "2019",
      "topmostSubform[0].Page1[0].Jourconvocation[0]": "03",
      "topmostSubform[0].Page1[0].Moisconvocation[0]": "07",
      "topmostSubform[0].Page1[0].Annéeconvocation[0]": "2019",
      "topmostSubform[0].Page1[0].Heureconvocation[0]": "20",
      "topmostSubform[0].Page1[0].Minuteconvocation[0]": "16",
      "topmostSubform[0].Page1[0].Nomdelorganisme[0]": "Association ARCAT",
      "topmostSubform[0].Page1[0].PréfectureayantDélivré[0]": "Paris, 75",
      "topmostSubform[0].Page1[0].NumAgrement[0]": "1000900293",
      "topmostSubform[0].Page1[0].AdressePostale[0]":
        "14 rue de Buzenval, CHRS, bleu, Paris, 75014",
      "topmostSubform[0].Page1[0].Courriel[1]": "marko@yopmail.com",
      "topmostSubform[0].Page1[0].téléphone[1]": "0148252303",
      "topmostSubform[0].Page1[0].EntretienAvec[0]": "Anguet Anaïs",
      "topmostSubform[0].Page1[0].EntretienAdresse[0]":
        "14 rue de Buzenval, CHRS, bleu, Paris, 75014",
      "topmostSubform[0].Page2[0].Décision[0]": "2",
      "topmostSubform[0].Page2[0].MotifRefus[0]":
        "Absence de lien avec la commune (CCAS/commune) : TEST",
      "topmostSubform[0].Page2[0].OrientationProposée[0]": "CCAS"
    };
    expect(await service.infosPdf).toEqual(datasAttendues);

    usager.decision.motifDetails = "";
    service.attestation(usager, user);
    expect(service.motifRefus).toEqual(
      "Absence de lien avec la commune (CCAS/commune)"
    );
  });
});
