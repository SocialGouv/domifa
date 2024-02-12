import { InteractionsModule } from "../../../interactions/interactions.module";
import { AppLogsService } from "../../../modules/app-logs/app-logs.service";
import { StructuresModule } from "../../../structures/structure.module";
import { UsersModule } from "../../../users/users.module";
import { AppTestContext, AppTestHelper } from "../../../util/test";
import { AdminStructuresService } from "../../../_portail-admin/admin-structures/services";
import { UsagersService } from "../../services";
import { UsagerStructureDocsController } from "../usager-structure-docs.controller";
import { UsagerHistoryStateService } from "../../services/usagerHistoryState.service";

describe("UsagerStructureDocs Controller", () => {
  let controller: UsagerStructureDocsController;

  let context: AppTestContext;

  beforeAll(async () => {
    context = await AppTestHelper.bootstrapTestApp({
      controllers: [UsagerStructureDocsController],
      imports: [UsersModule, InteractionsModule, StructuresModule],
      providers: [
        UsagersService,
        AdminStructuresService,
        AppLogsService,
        UsagerHistoryStateService,
      ],
    });
    controller = context.module.get<UsagerStructureDocsController>(
      UsagerStructureDocsController
    );
  });

  afterAll(async () => {
    await AppTestHelper.tearDownTestApp(context);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });
});
