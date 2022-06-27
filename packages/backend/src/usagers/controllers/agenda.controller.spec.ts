import { InteractionsModule } from "../../interactions/interactions.module";
import { StructuresModule } from "../../structures/structure.module";
import { UsersModule } from "../../users/users.module";
import { AppTestContext, AppTestHelper } from "../../util/test";

import { UsagersService } from "../services/usagers.service";
import { AgendaController } from "./agenda.controller";

describe("Agenda Controller", () => {
  let controller: AgendaController;

  let context: AppTestContext;

  beforeAll(async () => {
    context = await AppTestHelper.bootstrapTestApp({
      controllers: [AgendaController],
      imports: [UsersModule, InteractionsModule, StructuresModule],
      providers: [UsagersService],
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
