import { DatabaseModule } from "../../database/database.module";
import { InteractionsModule } from "../../interactions/interactions.module";
import { UsersService } from "../../users/services/users.service";
import { UsersModule } from "../../users/users.module";
import { AppTestContext, AppTestHelper } from "../../util/test";
import { CerfaService } from "../services/cerfa.service";
import { DocumentsService } from "../services/documents.service";
import { UsagersService } from "../services/usagers.service";
import { UsagersProviders } from "../usagers.providers";
import { UsagersController } from "./usagers.controller";

describe("Usagers Controller", () => {
  let controller: UsagersController;
  let userService: UsersService;

  let context: AppTestContext;

  beforeAll(async () => {
    context = await AppTestHelper.bootstrapTestApp({
      controllers: [UsagersController],
      imports: [DatabaseModule, UsersModule, InteractionsModule],
      providers: [
        CerfaService,
        UsagersService,
        DocumentsService,
        ...UsagersProviders,
      ],
    });

    controller = context.module.get<UsagersController>(UsagersController);
    userService = context.module.get<UsersService>(UsersService);
  });
  afterAll(async () => {
    await AppTestHelper.tearDownTestApp(context);
  });

  it("GET by ID ", async () => {
    expect(controller).toBeDefined();
    /* const user = await userService.findOne({ id: 1 });
    expect(await controller.findOne(1, user)).toBeDefined();
    try {
      await controller.findOne(30, user);
    } catch (err) {
      expect(err.message).toEqual("USAGER_NOT_FOUND");
    }*/
  });
  /*
  it("GET Document  📁", async () => {
    const user = await userService.findOne({ id: 1 });
    try {
      await controller.getDocument(2, 10, null, user);
    } catch (err) {
      expect(err.message).toEqual("DOC_NOT_FOUND");
    }
  });
  */
});
