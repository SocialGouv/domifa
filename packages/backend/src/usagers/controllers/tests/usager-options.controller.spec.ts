import { AuthModule } from "../../../auth/auth.module";
import { StructuresModule } from "../../../structures/structure.module";
import { UsersModule } from "../../../modules/users/users.module";
import { AppTestContext, AppTestHelper } from "../../../util/test";
import { UsagersService, UsagerOptionsHistoryService } from "../../services";
import { UsagersModule } from "../../usagers.module";
import { UsagerOptionsController } from "../usager-options.controller";

describe("UsagerOptions Controller", () => {
  let controller: UsagerOptionsController;
  let context: AppTestContext;

  beforeAll(async () => {
    context = await AppTestHelper.bootstrapTestApp({
      controllers: [UsagerOptionsController],
      imports: [UsagersModule, AuthModule, UsersModule, StructuresModule],
      providers: [UsagersService, UsagerOptionsHistoryService],
    });
    controller = context.module.get<UsagerOptionsController>(
      UsagerOptionsController
    );
  });

  afterAll(async () => {
    await AppTestHelper.tearDownTestApp(context);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });
});
