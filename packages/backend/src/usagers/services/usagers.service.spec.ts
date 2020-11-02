import { forwardRef } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { DatabaseModule } from "../../database/database.module";
import { UsersService } from "../../users/services/users.service";
import { UsersModule } from "../../users/users.module";
import { CreateUsagerDto } from "../dto/create-usager.dto";
import { SearchDto } from "../dto/search.dto";
import { UsagersProviders } from "../usagers.providers";
import { CerfaService } from "./cerfa.service";
import { UsagersService } from "./usagers.service";

describe("UsagersService", () => {
  let service: UsagersService;
  let userService: UsersService;

  const fakeUsagerDto = new CreateUsagerDto();
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
      providers: [UsagersService, CerfaService, ...UsagersProviders],
    }).compile();

    service = module.get<UsagersService>(UsagersService);
    userService = module.get<UsersService>(UsersService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  it("0. Create / Read / Update / Delete", async () => {
    // CREATE
    const user = await userService.findOne({ id: 1 });

    // LAST ID
    expect(await service.findLast(user.structureId)).toEqual(7);

    const usagerTest = await service.create(fakeUsagerDto, user);

    expect(usagerTest).toBeDefined();
    expect(usagerTest.id).toEqual(6);

    // READ
    const usager = await service.findById(6, user.structureId);
    expect(usager).toBeTruthy();
    expect(usager.nom).toEqual("Usager");
    expect(usager.sexe).toEqual("homme");

    // UPDATE
    usager.nom = "Nouveau nom";
    usager.prenom = "Nouveau prénom";

    await service.patch(usager, usager._id);
    const updatedUsager = await service.findById(6, user.structureId);

    expect(updatedUsager.nom).toEqual("Nouveau nom");
    expect(updatedUsager.prenom).toEqual("Nouveau prénom");

    // DELETE
    const deletedUsager = await service.delete(updatedUsager._id);
    expect(await deletedUsager.deletedCount).toEqual(1);
  });

  it("2. Doublons", async () => {
    const user = await userService.findOne({ id: 1 });

    const doublons = await service.isDoublon("Lou", "Li", 2, user);
    expect(doublons.length).toEqual(1);
  });

  it("2. Search", async () => {
    searchDto.statut = "VALIDE";
    const user = await userService.findOne({ id: 2 });
    /*
    service.search(searchDto, user.structureId);
    expect(service.searchQuery).toEqual({
      "decision.statut": "VALIDE",
      structureId: user.structureId
    });
    expect(service.sort).toEqual({ nom: "ascending" });
    searchDto.sort = "za";
    searchDto.interactionType = "courrierIn";
    service.search(searchDto, user.structureId);
    expect(service.sort).toEqual({ nom: "descending" });
    expect(service.searchQuery).toEqual({
      "decision.statut": "VALIDE",
      "lastInteraction.nbCourrier": { $gt: 0 },
      structureId: user.structureId
    });
    delete searchDto.interactionType;
    searchDto.name = "as";
    service.search(searchDto, user.structureId);
    expect(service.searchQuery).toEqual({
      $or: [
        { nom: { $regex: ".*as.*", $options: "-i" } },
        { prenom: { $regex: ".*as.*", $options: "-i" } },
        { surnom: { $regex: ".*as.*", $options: "-i" } }
      ],
      "decision.statut": "VALIDE",
      structureId: user.structureId
    });*/
  });
});
