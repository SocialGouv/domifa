import { Test, TestingModule } from "@nestjs/testing";
import * as mongoose from "mongoose";
import { DatabaseModule } from "../database/database.module";
import { UsagersProviders } from "../usagers/usagers.providers";
import { UsersProviders } from "../users/users.providers";
import { StructureDto } from "./structure-dto";
import { StructuresProviders } from "./structures-providers";
import { StructuresService } from "./structures.service";

describe("Structure Service", () => {
  let service: StructuresService;
  const structureDto = new StructureDto();

  structureDto.nom = "Association Amicale";
  structureDto.structureType = "asso";
  structureDto.adresse = "15 rue des bois";
  structureDto.adressePostale = "15 rue des bois, 75013 PARIS";
  structureDto.complementAdresse = "";
  structureDto.codePostal = "75013";
  structureDto.ville = "Paris";
  structureDto.agrement = "10091099191";
  structureDto.departement = "PARIS";
  structureDto.email = "structure@domifa.net";
  structureDto.phone = "0101010101";
  structureDto.responsable = {
    fonction: "Président",
    nom: "Hidalin",
    prenom: "Marc"
  };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [DatabaseModule],
      providers: [
        StructuresService,
        ...StructuresProviders,
        ...UsagersProviders,
        ...UsersProviders
      ]
    }).compile();
    service = module.get<StructuresService>(StructuresService);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoose.connection.close();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  it("0. Create / Read / Update / Delete", async () => {
    // LAST ID
    expect(service.findAll()).toBeTruthy();
    expect(await service.findLast()).toEqual(4);

    // CREATE
    const newStructure = await service.create(structureDto);
    expect(await newStructure).toBeDefined();
    expect(await newStructure.id).toEqual(4);

    // READ
    const structure = await service.findById(4);
    expect(await structure).toBeTruthy();
    expect(await structure.ville).toEqual("Paris");
    expect(await structure.nom).toEqual("Association Amicale");
    structureDto.id = await structure.id;

    // DELETE
    const deletedstructure = await service.deleteById(4);
    expect(await deletedstructure.deletedCount).toEqual(1);
  });
});
