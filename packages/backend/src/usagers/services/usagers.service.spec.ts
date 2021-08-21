import { forwardRef } from "@nestjs/common";
import { usagerRepository, usersRepository } from "../../database";
import { UsersModule } from "../../users/users.module";
import { AppTestContext, AppTestHelper } from "../../util/test";
import { CreateUsagerDto } from "../dto/create-usager.dto";
import { SearchDto } from "../dto/search.dto";
import { CerfaService } from "./cerfa.service";
import { usagerDeletor } from "./usagerDeletor.service";
import { UsagersService } from "./usagers.service";

describe("UsagersService", () => {
  let service: UsagersService;

  const fakeUsagerDto = new CreateUsagerDto();
  const searchDto = new SearchDto();

  fakeUsagerDto.nom = "Usager";
  fakeUsagerDto.prenom = "De test";
  fakeUsagerDto.surnom = "Chips";
  fakeUsagerDto.sexe = "homme";
  fakeUsagerDto.dateNaissance = new Date();
  fakeUsagerDto.villeNaissance = "Paris";
  fakeUsagerDto.email = "chips@gmail.com";

  let context: AppTestContext;

  beforeAll(async () => {
    context = await AppTestHelper.bootstrapTestApp({
      imports: [forwardRef(() => UsersModule)],
      providers: [UsagersService, CerfaService],
    });
    service = context.module.get<UsagersService>(UsagersService);
  });
  afterAll(async () => {
    await AppTestHelper.tearDownTestApp(context);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  it("0. Create / Read / Update / Delete", async () => {
    // CREATE
    const user = await usersRepository.findOne({ id: 1 });

    const usagerTest = await service.create(fakeUsagerDto, user);

    expect(usagerTest).toBeDefined();

    // READ
    const usager = await usagerRepository.findOne({
      ref: usagerTest.ref,
      structureId: user.structureId,
    });
    expect(usager).toBeTruthy();
    expect(usager.nom).toEqual(fakeUsagerDto.nom);
    expect(usager.sexe).toEqual(fakeUsagerDto.sexe);

    // UPDATE
    await service.patch(
      { uuid: usager.uuid },
      {
        nom: "Nouveau nom",
        prenom: "Nouveau prénom",
      }
    );
    const updatedUsager = await usagerRepository.findOne({
      ref: usagerTest.ref,
      structureId: user.structureId,
    });

    expect(updatedUsager.nom).toEqual("Nouveau nom");
    expect(updatedUsager.prenom).toEqual("Nouveau prénom");

    // DELETE
    const deletedCount = await usagerDeletor.deleteUsager({
      usagerRef: usagerTest.ref,
      structureId: user.structureId,
    });
    expect(await deletedCount).toEqual(1);
  });
});
