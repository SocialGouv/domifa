import { DatabaseModule } from "../database/database.module";
import { InteractionsModule } from "../interactions/interactions.module";
import { MailsModule } from "../mails/mails.module";
import { UsagersModule } from "../usagers/usagers.module";
import { UsersModule } from "../users/users.module";
import { AppTestContext, AppTestHelper } from "../util/test";
import { StructuresService } from "./services/structures.service";
import { StructuresController } from "./structures.controller";

describe("Stuctures Controller", () => {
  let context: AppTestContext;

  beforeAll(async () => {
    context = await AppTestHelper.bootstrapTestApp({
      controllers: [StructuresController],
      imports: [
        DatabaseModule,
        UsersModule,
        MailsModule,
        UsagersModule,
        InteractionsModule,
      ],
      providers: [{ provide: StructuresService, useValue: {} }],
    });
  });
  afterAll(async () => {
    await AppTestHelper.tearDownTestApp(context);
  });

  it("should be defined", async () => {
    const controller = context.module.get<StructuresController>(
      StructuresController
    );
    expect(controller).toBeDefined();
  });
});
