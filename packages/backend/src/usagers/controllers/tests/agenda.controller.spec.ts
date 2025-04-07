import { InteractionsModule } from "../../../modules/interactions/interactions.module";
import { StructuresModule } from "../../../structures/structure.module";
import { UsersModule } from "../../../modules/users/users.module";
import { AppTestContext, AppTestHelper } from "../../../util/test";
import { UsagerHistoryStateService } from "../../services/usagerHistoryState.service";

import { UsagersService } from "../../services/usagers.service";
import { AgendaController } from "../agenda.controller";

describe("Agenda Controller", () => {
  let controller: AgendaController;
  let context: AppTestContext;

  beforeAll(async () => {
    context = await AppTestHelper.bootstrapTestApp({
      controllers: [AgendaController],
      imports: [UsersModule, InteractionsModule, StructuresModule],
      providers: [UsagersService, UsagerHistoryStateService],
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
