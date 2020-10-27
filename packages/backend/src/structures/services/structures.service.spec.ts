import { Test, TestingModule } from "@nestjs/testing";
import * as mongoose from "mongoose";

import { StructuresService } from "./structures.service";
import { StructureDto } from "../dto/structure.dto";
import { DatabaseModule } from "../../database/database.module";
import { StructuresProviders } from "../structures-providers";
import { UsagersProviders } from "../../usagers/usagers.providers";
import { UsersProviders } from "../../users/users.providers";
import { configService } from "../../config";

describe("Structure Service", () => {
  let service: StructuresService;
  const structureDto = new StructureDto();

  structureDto.nom = "Association Amicale";
  structureDto.structureType = "asso";
  structureDto.adresse = "15 rue des bois";
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
    prenom: "Marc",
  };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [DatabaseModule],
      providers: [
        StructuresService,
        ...StructuresProviders,
        ...UsagersProviders,
        ...UsersProviders,
      ],
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
    expect(service.findAllPublic()).toBeTruthy();
    expect(await service.findLast()).toEqual(2);

    // CREATE
    const newStructure = await service.create(structureDto);
    expect(newStructure).toBeDefined();
    expect(newStructure.id).toEqual(2);

    // READ
    const structure = await service.findOne(2);
    expect(structure).toBeTruthy();
    expect(structure.ville).toEqual("Paris");
    expect(structure.nom).toEqual("Association Amicale");

    // DELETE
    const deletedstructure = await service.delete(structure._id);
    expect(await deletedstructure.deletedCount).toEqual(1);
  });
});
