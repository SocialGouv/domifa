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

  it("0. Cerfa Service should be defined", () => {
    expect(service).toBeDefined();
  });

  it("1. Load PDF demande", () => {
    expect(service.pdfForm).toEqual("../../ressources/demande.pdf");

    const pdfForm1 = "../../ressources/demande.pdf";
    expect(fs.existsSync(path.resolve(__dirname, pdfForm1))).toBe(true);

    const pdfForm2 = "../../ressources/attestation.pdf";
    expect(fs.existsSync(path.resolve(__dirname, pdfForm2))).toBe(true);
  });

  it("3. Attestation de demande", async () => {
    const usager = await usagerService.findById(6);
    const user = await userService.findById(1);
    const datasAttendues = {
      "topmostSubform[0].Page1[0].AyantsDroits[0]":
        "Mordic Martin 12/09/2009 né(e) le 8/12/1980\t\t Raphael Mordi 20/02/2004 né(e) le 8/12/1980\t\t ",
      "topmostSubform[0].Page1[0].Datenaissance1[0]": "8",
      "topmostSubform[0].Page1[0].Datenaissance2[0]": "12",
      "topmostSubform[0].Page1[0].Datenaissance3[0]": "1980",
      "topmostSubform[0].Page1[0].LieuNaissance[0]": "Ecouen Ezanville",
      "topmostSubform[0].Page1[0].Mme-Monsieur1[0]": "2",
      "topmostSubform[0].Page1[0].Noms[0]": "RAMZI",
      "topmostSubform[0].Page1[0].Prénoms[0]": "DEBARD",
      "topmostSubform[0].Page2[0].NomOrgaDomiciliataire[0]":
        "Association ARCAT",
      "topmostSubform[0].Page1[0].Courriel[0]": "",
      "topmostSubform[0].Page1[0].téléphone[0]": "0606060606",
      "topmostSubform[0].Page2[0].NuméroAgrément[0]": "1000900293",
      "topmostSubform[0].Page2[0].PrefectureDelivrAgrément[0]": "Paris, 75",
      "topmostSubform[0].Page1[0].Groupe_de_boutons_radio[0]": "1",
      "topmostSubform[0].Page1[0].LieuNaissance[1]": "Ecouen Ezanville",
      "topmostSubform[0].Page2[0].Mme-Monsieur2[0]": "2",
      "topmostSubform[0].Page2[0].NomsDemandeur[0]": "RAMZI",
      "topmostSubform[0].Page2[0].PrénomsDemandeur[0]": "DEBARD",
      "topmostSubform[0].Page2[0].JourNaissanceDemandeur[0]": "8",
      "topmostSubform[0].Page2[0].MoisNaissanceDemandeur[0]": "12",
      "topmostSubform[0].Page2[0].AnnéeNaissanceDemandeur[0]": "1980",
      "topmostSubform[0].Page2[0].LieuNaissanceDemandeur[0]":
        "ECOUEN EZANVILLE",
      "topmostSubform[0].Page1[0].FaitLeOrganisme1[0]": "3",
      "topmostSubform[0].Page1[0].FaitLeOrganisme2[0]": "7",
      "topmostSubform[0].Page1[0].FaitLeOrganisme3[0]": "2019",
      "topmostSubform[0].Page1[0].FaitLeDemandeur1[0]": "3",
      "topmostSubform[0].Page1[0].FaitLeDemandeur2[0]": "7",
      "topmostSubform[0].Page1[0].FaitLeDemandeur3[0]": "2019",
      "topmostSubform[0].Page1[0].Jourconvocation[0]": "11",
      "topmostSubform[0].Page1[0].Moisconvocation[0]": "7",
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
    expect(await service.infosPdf).toEqual(datasAttendues);
  });

  it("5. Attestation de domiciliation", async () => {
    const usager = await usagerService.findById(5);
    const user = await userService.findById(1);
    expect(usager).toBeDefined();
    expect(user).toBeDefined();
    service.attestation(usager, user);

    const datasAttendues = {
      "topmostSubform[0].Page1[0].AyantsDroits[0]":
        "Adélio Mauricette 04/05/1999 né(e) le 5/12/1956\t\t ",
      "topmostSubform[0].Page1[0].Datenaissance1[0]": "5",
      "topmostSubform[0].Page1[0].Datenaissance2[0]": "12",
      "topmostSubform[0].Page1[0].Datenaissance3[0]": "1956",
      "topmostSubform[0].Page1[0].LieuNaissance[0]": "Ile maurice",
      "topmostSubform[0].Page1[0].Mme-Monsieur1[0]": "1",
      "topmostSubform[0].Page1[0].Noms[0]": "ADÉLIO",
      "topmostSubform[0].Page1[0].Prénoms[0]": "LAURENCE",
      "topmostSubform[0].Page2[0].NomOrgaDomiciliataire[0]":
        "Association ARCAT",
      "topmostSubform[0].Page2[0].NuméroAgrément[0]": "1000900293",
      "topmostSubform[0].Page2[0].PrefectureDelivrAgrément[0]": "Paris, 75",
      "topmostSubform[0].Page1[0].Nomdelorganisme[0]": "Association ARCAT",
      "topmostSubform[0].Page1[0].RespOrganisme[0]": "Jean-Michel Marin",
      "topmostSubform[0].Page1[0].PréfectureayantDélivré[0]": "Paris, 75",
      "topmostSubform[0].Page1[0].NumAgrement[0]": "1000900293",
      "topmostSubform[0].Page1[0].AdressePostaleOrganisme[0]":
        "14 rue de Buzenval Paris 75014",
      "topmostSubform[0].Page1[0].Courriel[0]": "marko@yopmail.com",
      "topmostSubform[0].Page1[0].téléphone[0]": "0148252303",
      "topmostSubform[0].Page1[0].Noms2[0]": "Adélio",
      "topmostSubform[0].Page1[0].Prénoms2[0]": "Laurence",
      "topmostSubform[0].Page1[0].AdressePostale[0]":
        "14 rue de Buzenval CHRS, bleu, Paris 75014"
    };
    expect(service.infosPdf).toEqual(datasAttendues);
  });
});
