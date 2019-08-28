import { Test, TestingModule } from "@nestjs/testing";
import * as mongoose from "mongoose";
import { DatabaseModule } from "../../database/database.module";
import { UsersModule } from "../../users/users.module";
import { SearchDto } from "../dto/search";
import { UsagersDto } from "../dto/usagers.dto";
import { Usager } from "../interfaces/usagers";
import { UsagerSchema } from "../usager.schema";
import { UsagersProviders } from "../usagers.providers";

import { forwardRef } from "@nestjs/common";
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

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [DatabaseModule, forwardRef(() => UsersModule)],
      providers: [UsagersService, CerfaService, ...UsagersProviders]
    }).compile();

    service = module.get<UsagersService>(UsagersService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  it("0. Create / Read / Update / Delete", async () => {
    // LAST ID
    expect(service.findAll()).toBeTruthy();
    expect(await service.findLast()).toEqual(5);

    // CREATE
    const usagerTest = await service.create(fakeUsagerDto);
    expect(await usagerTest).toBeDefined();
    expect(await usagerTest.id).toEqual(5);

    // READ
    const usager = await service.findById(5);
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
    const deletedUsager = await service.deleteById(5);
    expect(await deletedUsager.deletedCount).toEqual(1);
  });

  it("2. Doublons", async () => {
    const doublons = await service.isDoublon("del", "Kar");
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
      $or: [
        { nom: { $regex: ".*as.*", $options: "-i" } },
        { prenom: { $regex: ".*as.*", $options: "-i" } },
        { surnom: { $regex: ".*as.*", $options: "-i" } }
      ],
      "decision.statut": "valide"
    });
  });

  it("2. Document Functions 📁 ", async () => {
    const doc = await service.getDocument(3, 0);
    expect(doc).toEqual({
      createdAt: new Date("2019-07-05T13:11:42.795Z"),
      createdBy: "Yassine",
      filetype: "image/jpeg",
      label: "Lettre d'identité",
      path: "1d94d21bb6e11d230a4b41c10a564102e2.jpg"
    });

    const docError = await service.getDocument(3, 10);
    expect(docError).toBeNull();
  });
});
