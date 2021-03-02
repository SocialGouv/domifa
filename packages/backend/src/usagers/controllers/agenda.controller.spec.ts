import { DatabaseModule } from "../../database";
import { InteractionsModule } from "../../interactions/interactions.module";
import { StructuresModule } from "../../structures/structure.module";
import { UsersModule } from "../../users/users.module";
import { AppTestContext, AppTestHelper } from "../../util/test";
import { CerfaService } from "../services/cerfa.service";
import { DocumentsService } from "../services/documents.service";
import { UsagersService } from "../services/usagers.service";
import { UsagersProviders } from "../usagers.providers";
import { AgendaController } from "./agenda.controller";

describe("Agenda Controller", () => {
  let controller: AgendaController;

  let context: AppTestContext;

  beforeAll(async () => {
    context = await AppTestHelper.bootstrapTestApp({
      controllers: [AgendaController],
      imports: [
        DatabaseModule,
        UsersModule,
        InteractionsModule,
        StructuresModule,
      ],
      providers: [
        CerfaService,
        UsagersService,
        DocumentsService,
        ...UsagersProviders,
      ],
    });
    controller = context.module.get<AgendaController>(AgendaController);
  });
  afterAll(async () => {
    await AppTestHelper.tearDownTestApp(context);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });
});
