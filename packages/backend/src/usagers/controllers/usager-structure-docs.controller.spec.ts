import { InteractionsModule } from "../../interactions/interactions.module";
import { StructuresModule } from "../../structures/structure.module";
import { UsersModule } from "../../users/users.module";
import { AppTestContext, AppTestHelper } from "../../util/test";
import { AdminStructuresService } from "../../_portail-admin/admin-structures/services";

import { UsagersService } from "../services/usagers.service";
import { UsagerStructureDocsController } from "./usager-structure-docs.controller";
import { AppLogsService } from "../../modules/app-logs/app-logs.service";

describe("UsagerStructureDocs Controller", () => {
  let controller: UsagerStructureDocsController;

  let context: AppTestContext;

  beforeAll(async () => {
    context = await AppTestHelper.bootstrapTestApp({
      controllers: [UsagerStructureDocsController],
      imports: [UsersModule, InteractionsModule, StructuresModule],
      providers: [UsagersService, AdminStructuresService, AppLogsService],
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
