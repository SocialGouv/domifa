import { forwardRef } from "@nestjs/common";
import { DatabaseModule } from "../../database/database.module";
import { InteractionsModule } from "../../interactions/interactions.module";
import { StructuresModule } from "../../structures/structure.module";
import { UsersModule } from "../../users/users.module";
import { AppTestContext, AppTestHelper } from "../../util/test";
import { CerfaService } from "../services/cerfa.service";
import { DocumentsService } from "../services/documents.service";
import { UsagersService } from "../services/usagers.service";
import { UsagersModule } from "../usagers.module";
import { UsagersProviders } from "../usagers.providers";
import { DocsController } from "./docs.controller";

describe("Docs Controller", () => {
  let controller: DocsController;

  let context: AppTestContext;

  beforeAll(async () => {
    context = await AppTestHelper.bootstrapTestApp({
      controllers: [DocsController],
      imports: [
        DatabaseModule,
        forwardRef(() => UsersModule),
        forwardRef(() => StructuresModule),
        forwardRef(() => UsagersModule),
        forwardRef(() => InteractionsModule),
      ],
      providers: [
        CerfaService,
        UsagersService,
        DocumentsService,
        ...UsagersProviders,
      ],
    });
    controller = context.module.get<DocsController>(DocsController);
  });
  afterAll(async () => {
    await AppTestHelper.tearDownTestApp(context);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });
});
