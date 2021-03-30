import { InteractionsModule } from "../../interactions/interactions.module";
import { UsersModule } from "../../users/users.module";
import { AppTestContext, AppTestHelper } from "../../util/test";
import { CerfaService } from "../services/cerfa.service";
import { DocumentsService } from "../services/documents.service";
import { UsagersService } from "../services/usagers.service";
import { UsagersController } from "./usagers.controller";

describe("Usagers Controller", () => {
  let controller: UsagersController;

  let context: AppTestContext;

  beforeAll(async () => {
    context = await AppTestHelper.bootstrapTestApp({
      controllers: [UsagersController],
      imports: [UsersModule, InteractionsModule],
      providers: [CerfaService, UsagersService, DocumentsService],
    });

    controller = context.module.get<UsagersController>(UsagersController);
  });
  afterAll(async () => {
    await AppTestHelper.tearDownTestApp(context);
  });

  it("GET by ID ", async () => {
    expect(controller).toBeDefined();
  });
});
