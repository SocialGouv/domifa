import { DatabaseModule } from "../../database/database.module";
import { StructuresModule } from "../../structures/structure.module";
import { UsersService } from "../../users/services/users.service";
import { UsersModule } from "../../users/users.module";
import { UsersProviders } from "../../users/users.providers";
import { AppTestContext, AppTestHelper } from "../../util/test";
import { UsagersModule } from "../usagers.module";
import { UsagersProviders } from "../usagers.providers";
import { CerfaService } from "./cerfa.service";
import { UsagersService } from "./usagers.service";

describe("CerfaService", () => {
  let service: CerfaService;
  let usagerService: UsagersService;
  let userService: UsersService;

  let context: AppTestContext;

  beforeAll(async () => {
    context = await AppTestHelper.bootstrapTestApp({
      imports: [DatabaseModule, UsersModule, UsagersModule, StructuresModule],
      providers: [
        CerfaService,
        UsersService,
        UsagersService,
        ...UsagersProviders,
        ...UsersProviders,
      ],
    });

    service = context.module.get<CerfaService>(CerfaService);
    usagerService = context.module.get<UsagersService>(UsagersService);
    userService = context.module.get<UsersService>(UsersService);
  });
  afterAll(async () => {
    await AppTestHelper.tearDownTestApp(context);
  });

  it("0. Init + variables", () => {
    expect(service).toBeDefined();
  });

});
