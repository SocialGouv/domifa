import { InteractionsModule } from "../../interactions/interactions.module";
import { StructuresModule } from "../../structures/structure.module";
import { UsersModule } from "../../users/users.module";
import { AppTestContext, AppTestHelper } from "../../util/test";

import { UsagerDocsController } from "./usager-docs.controller";
import { AppLogsService } from "../../modules/app-logs/app-logs.service";

describe("Document Controller", () => {
  let controller: UsagerDocsController;

  let context: AppTestContext;

  beforeAll(async () => {
    context = await AppTestHelper.bootstrapTestApp({
      controllers: [UsagerDocsController],
      imports: [UsersModule, InteractionsModule, StructuresModule],
      providers: [AppLogsService],
    });
    controller = context.module.get<UsagerDocsController>(UsagerDocsController);
  });
  afterAll(async () => {
    await AppTestHelper.tearDownTestApp(context);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });
});
