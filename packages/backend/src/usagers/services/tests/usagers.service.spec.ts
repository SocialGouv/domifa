import { forwardRef } from "@nestjs/common";
import {
  structureRepository,
  usagerRepository,
  userStructureRepository,
} from "../../../database";
import { UsersModule } from "../../../modules/users/users.module";
import { AppTestContext, AppTestHelper } from "../../../util/test";
import { UsagersService } from "../usagers.service";

import { UsagerHistoryStateService } from "../usagerHistoryState.service";
import { UserStructure } from "@domifa/common";
import { UsagersLogsService } from "../usagers-logs.service";
import { AppLogsModule } from "../../../modules/app-logs/app-logs.module";
import CREATE_USAGER_DTO from "./CREATE_USAGER_DTO.const";

describe("UsagersService", () => {
  let service: UsagersService;
  let context: AppTestContext;

  beforeAll(async () => {
    context = await AppTestHelper.bootstrapTestApp({
      imports: [forwardRef(() => UsersModule), AppLogsModule],
      providers: [
        UsagersService,
        UsagerHistoryStateService,
        UsagersLogsService,
      ],
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

    const usagerTest = await service.create(CREATE_USAGER_DTO, user);

    expect(usagerTest).toBeDefined();

    // READ
    const usager = await usagerRepository.findOneBy({
      ref: usagerTest.ref,
      structureId: user.structureId,
    });
    expect(usager).toBeTruthy();
    expect(usager.nom).toEqual(CREATE_USAGER_DTO.nom);
    expect(usager.sexe).toEqual(CREATE_USAGER_DTO.sexe);

    await usagerRepository.delete({ uuid: usager.uuid });

    const deletedUsager = await usagerRepository.findOneBy({
      ref: usagerTest.ref,
      structureId: user.structureId,
    });

    expect(deletedUsager).toBeNull();
  });
});
