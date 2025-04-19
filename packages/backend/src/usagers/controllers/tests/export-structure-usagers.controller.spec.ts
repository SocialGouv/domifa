import { InteractionsModule } from "../../../modules/interactions/interactions.module";
import { AppLogsService } from "../../../modules/app-logs/app-logs.service";
import { StructuresModule } from "../../../modules/structures/structure.module";
import { UsersModule } from "../../../modules/users/users.module";
import { AppTestContext, AppTestHelper } from "../../../util/test";
import { UsagersService } from "../../services";
import { UsagerHistoryStateService } from "../../services/usagerHistoryState.service";
import { ExportStructureUsagersController } from "../export-structure-usagers.controller";

describe("Export Controller", () => {
  let controller: ExportStructureUsagersController;

  let context: AppTestContext;

  beforeAll(async () => {
    context = await AppTestHelper.bootstrapTestApp({
      controllers: [ExportStructureUsagersController],
      imports: [UsersModule, InteractionsModule, StructuresModule],
      providers: [UsagersService, UsagerHistoryStateService, AppLogsService],
    });
    controller = context.module.get<ExportStructureUsagersController>(
      ExportStructureUsagersController
    );
  });
  afterAll(async () => {
    await AppTestHelper.tearDownTestApp(context);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });
});
