import { InteractionsModule } from "../../interactions/interactions.module";
import { UsagersModule } from "../../../usagers/usagers.module";
import { UsersModule } from "../../users/users.module";
import { AppTestContext, AppTestHelper } from "../../../util/test";
import { StructuresModule } from "../structure.module";
import { StructuresPublicController } from "./structures.public.controller";
import { MailsModule } from "../../mails/mails.module";
import { StatsModule } from "../../stats/stats.module";

describe("Stuctures Public Controller", () => {
  let context: AppTestContext;
  let controller: StructuresPublicController;

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
    controller = context.module.get<StructuresPublicController>(
      StructuresPublicController
    );
  });

  afterAll(async () => {
    await AppTestHelper.tearDownTestApp(context);
  });

  it("should be defined", async () => {
    expect(controller).toBeDefined();
  });
});
