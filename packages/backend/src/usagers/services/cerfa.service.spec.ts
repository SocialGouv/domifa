import { DatabaseModule } from "../../database";
import { StructuresModule } from "../../structures/structure.module";
import { UsersModule } from "../../users/users.module";
import { UsersProviders } from "../../users/users.providers";
import { AppTestContext, AppTestHelper } from "../../util/test";
import { UsagersModule } from "../usagers.module";
import { UsagersProviders } from "../usagers.providers";
import { CerfaService } from "./cerfa.service";
import { UsagersService } from "./usagers.service";

describe("CerfaService", () => {
  let service: CerfaService;

  let context: AppTestContext;

  beforeAll(async () => {
    context = await AppTestHelper.bootstrapTestApp({
      imports: [DatabaseModule, UsersModule, UsagersModule, StructuresModule],
      providers: [
        CerfaService,
        UsagersService,
        ...UsagersProviders,
        ...UsersProviders,
      ],
    });

    service = context.module.get<CerfaService>(CerfaService);
  });
  afterAll(async () => {
    await AppTestHelper.tearDownTestApp(context);
  });

  it("0. Init + variables", () => {
    expect(service).toBeDefined();
  });
});
