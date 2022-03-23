import { InteractionsModule } from "../../interactions/interactions.module";
import { StructuresModule } from "../../structures/structure.module";
import { UsersModule } from "../../users/users.module";
import { AppTestContext, AppTestHelper } from "../../util/test";

import { DocumentsService } from "../services/documents.service";
import { UsagersService } from "../services/usagers.service";
import { ExportStructureUsagersController } from "./export-structure-usagers.controller";

describe("Export Controller", () => {
  let controller: ExportStructureUsagersController;

  let context: AppTestContext;

  beforeAll(async () => {
    context = await AppTestHelper.bootstrapTestApp({
      controllers: [ExportStructureUsagersController],
      imports: [UsersModule, InteractionsModule, StructuresModule],
      providers: [UsagersService, DocumentsService],
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
