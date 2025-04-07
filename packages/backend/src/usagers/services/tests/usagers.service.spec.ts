import { forwardRef } from "@nestjs/common";
import {
  structureRepository,
  usagerRepository,
  userStructureRepository,
} from "../../../database";
import { UsersModule } from "../../../modules/users/users.module";
import { AppTestContext, AppTestHelper } from "../../../util/test";
import { CreateUsagerDto } from "../../dto";
import { UsagersService } from "../usagers.service";

import { UsagerHistoryStateService } from "../usagerHistoryState.service";
import { UserStructure } from "@domifa/common";

describe("UsagersService", () => {
  let service: UsagersService;

  const fakeUsagerDto = new CreateUsagerDto();

  fakeUsagerDto.nom = "Usager";
  fakeUsagerDto.prenom = "De test";
  fakeUsagerDto.surnom = "Chips";
  fakeUsagerDto.sexe = "homme";
  fakeUsagerDto.dateNaissance = new Date();
  fakeUsagerDto.villeNaissance = "Paris";
  fakeUsagerDto.email = "chips@gmail.com";
  fakeUsagerDto.telephone = {
    countryCode: "fr",
    numero: null,
  };

  let context: AppTestContext;

  beforeAll(async () => {
    context = await AppTestHelper.bootstrapTestApp({
      imports: [forwardRef(() => UsersModule)],
      providers: [UsagersService, UsagerHistoryStateService],
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
    const user = (await userStructureRepository.findOneBy({
      id: 1,
    })) as UserStructure;
    user.structure = await structureRepository.findOneBy({ id: 5 });

    const usagerTest = await service.create(fakeUsagerDto, user);

    expect(usagerTest).toBeDefined();

    // READ
    const usager = await usagerRepository.findOneBy({
      ref: usagerTest.ref,
      structureId: user.structureId,
    });
    expect(usager).toBeTruthy();
    expect(usager.nom).toEqual(fakeUsagerDto.nom);
    expect(usager.sexe).toEqual(fakeUsagerDto.sexe);

    await usagerRepository.delete({ uuid: usager.uuid });

    const deletedUsager = await usagerRepository.findOneBy({
      ref: usagerTest.ref,
      structureId: user.structureId,
    });

    expect(deletedUsager).toBeNull();
  });
});
