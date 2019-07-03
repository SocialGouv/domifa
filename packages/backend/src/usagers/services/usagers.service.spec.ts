import { Test, TestingModule } from "@nestjs/testing";
import * as mongoose from "mongoose";
import { DatabaseModule } from "../../database/database.module";
import { UsersModule } from "../../users/users.module";
import { SearchDto } from "../dto/search";
import { UsagersDto } from "../dto/usagers.dto";
import { Usager } from "../interfaces/usagers";
import { UsagerSchema } from "../usager.schema";
import { UsagersProviders } from "../usagers.providers";
import { CerfaService } from "./cerfa.service";
import { UsagersService } from "./usagers.service";

describe("UsagersService", () => {
  let service: UsagersService;
  const fakeUsagerDto = new UsagersDto();
  const fakePatchUsagerDto = new UsagersDto();
  const searchDto = new SearchDto();

  fakeUsagerDto.nom = "Usager";
  fakeUsagerDto.prenom = "De test";
  fakeUsagerDto.surnom = "Chips";
  fakeUsagerDto.sexe = "homme";
  fakeUsagerDto.dateNaissance = new Date();
  fakeUsagerDto.villeNaissance = "Paris";
  fakeUsagerDto.email = "chips@gmail.com";

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [DatabaseModule, UsersModule],
      providers: [UsagersService, CerfaService, ...UsagersProviders]
    }).compile();

    service = module.get<UsagersService>(UsagersService);
  });

  afterEach(async () => {
    await mongoose.disconnect();
    await mongoose.connection.close();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  it("0. Create / Read / Update / Delete", async () => {
    // LAST ID
    expect(service.findAll()).toBeTruthy();
    expect(await service.findLastUsager()).toEqual(6);

    // CREATE
    const newUser = await service.create(fakeUsagerDto);
    expect(await newUser).toBeDefined();
    expect(await newUser.id).toEqual(6);

    // READ
    const usager = await service.findById(6);
    expect(await usager).toBeTruthy();
    expect(await usager.nom).toEqual("Usager");
    expect(await usager.sexe).toEqual("homme");

    // UPDATE
    fakePatchUsagerDto.nom = "Nouveau nom";
    fakePatchUsagerDto.prenom = "Nouveau prénom";
    fakePatchUsagerDto.id = await usager.id;

    const updatedUser = await service.patch(fakePatchUsagerDto);

    expect(await updatedUser.nom).toEqual("Nouveau nom");
    expect(await updatedUser.prenom).toEqual("Nouveau prénom");

    // DELETE
    const deletedUsager = await service.deleteById(6);
    expect(await deletedUsager.deletedCount).toEqual(1);
  });

  it("2. Doublons", async () => {
    const doublons = await service.isDoublon("Sam", "bam");
    expect(doublons.length).toEqual(1);
  });

  it("2. Search", async () => {
    expect(service.findAll()).toBeTruthy();

    searchDto.sort = "az";
    searchDto.statut = "valide";

    service.search(searchDto);
    expect(service.searchQuery).toEqual({ "decision.statut": "valide" });
    expect(service.sort).toEqual({ nom: "ascending" });

    searchDto.sort = "za";
    searchDto.interactionType = "courrierIn";

    service.search(searchDto);
    expect(service.sort).toEqual({ nom: "descending" });
    expect(service.searchQuery).toEqual({
      "decision.statut": "valide",
      "lastInteraction.nbCourrier": { $gt: 0 }
    });

    delete searchDto.interactionType;
    searchDto.name = "as";

    service.search(searchDto);
    expect(service.searchQuery).toEqual({
      "decision.statut": "valide",
      $or: [
        { nom: { $regex: ".*as.*", $options: "-i" } },
        { prenom: { $regex: ".*as.*", $options: "-i" } },
        { surnom: { $regex: ".*as.*", $options: "-i" } }
      ]
    });
  });
});
