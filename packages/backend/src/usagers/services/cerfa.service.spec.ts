import { StructuresModule } from "../../structures/structure.module";
import { UsersModule } from "../../users/users.module";
import { AppTestContext, AppTestHelper } from "../../util/test";
import { UsagersModule } from "../usagers.module";
import { CerfaService } from "./cerfa.service";
import { UsagersService } from "./usagers.service";

describe("CerfaService", () => {
  let service: CerfaService;

  let context: AppTestContext;

  beforeAll(async () => {
    context = await AppTestHelper.bootstrapTestApp({
      imports: [UsersModule, UsagersModule, StructuresModule],
      providers: [CerfaService, UsagersService],
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
