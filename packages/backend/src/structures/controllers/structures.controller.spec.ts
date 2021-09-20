import { InteractionsModule } from "../../interactions/interactions.module";
import { MailsModule } from "../../mails/mails.module";
import { StatsModule } from "../../stats/stats.module";
import { UsagersModule } from "../../usagers/usagers.module";
import { UsersModule } from "../../users/users.module";
import { AppTestContext, AppTestHelper } from "../../util/test";
import { StructuresModule } from "../structure.module";
import { StructuresController } from "./structures.controller";

describe("Stuctures Controller", () => {
  let context: AppTestContext;
  let controller: StructuresController;
  beforeAll(async () => {
    context = await AppTestHelper.bootstrapTestApp({
      controllers: [],
      imports: [
        UsersModule,
        MailsModule,
        UsagersModule,
        InteractionsModule,
        StatsModule,
        StructuresModule,
      ],
      providers: [],
    });
    controller = context.module.get<StructuresController>(StructuresController);
  });
  afterAll(async () => {
    await AppTestHelper.tearDownTestApp(context);
  });

  it("should be defined", async () => {
    expect(controller).toBeDefined();
  });
});
