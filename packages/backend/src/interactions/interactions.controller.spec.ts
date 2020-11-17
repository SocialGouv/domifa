import { Connection } from "typeorm";
import { appTypeormManager } from "../database/appTypeormManager.service";

import { DatabaseModule } from "../database/database.module";
import { UsagersService } from "../usagers/services/usagers.service";
import { UsagersModule } from "../usagers/usagers.module";
import { UsersService } from "../users/services/users.service";
import { UsersModule } from "../users/users.module";
import { AppTestContext, AppTestHelper } from "../util/test";
import { InteractionsController } from "./interactions.controller";
import { InteractionDto } from "./interactions.dto";

import { InteractionsService } from "./interactions.service";
import { AuthService } from "../auth/auth.service";

describe("Interactions Controller", () => {
  let controller: InteractionsController;
  let userService: UsersService;
  let authService: AuthService;
  let usagerService: UsagersService;

  let context: AppTestContext;

  let postgresTypeormConnection: Connection;

  beforeAll(async () => {
    context = await AppTestHelper.bootstrapTestApp({
      controllers: [InteractionsController],
      imports: [DatabaseModule, UsersModule, UsagersModule],
      providers: [InteractionsService],
    });

    controller = context.module.get<InteractionsController>(
      InteractionsController
    );

    authService = context.module.get<AuthService>(AuthService);
    userService = context.module.get<UsersService>(UsersService);

    usagerService = context.module.get<UsagersService>(UsagersService);

    postgresTypeormConnection = await appTypeormManager.connect();
  });

  afterAll(async () => {
    await AppTestHelper.tearDownTestApp(context);
    postgresTypeormConnection.close();
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  it("GET by ID ", async () => {
    const interaction = new InteractionDto();
    interaction.type = "courrierOut";
    interaction.content = "Les impôts";
    const user = await authService.findAuthUser({ id: 2 });
    const usager = await usagerService.findById(1, 1);

    try {
      const testFc = await controller.postInteraction(
        interaction,
        user,
        usager
      );
      expect(testFc).toBeDefined();
    } catch (err) {
      expect(err.message).toEqual("NOT_FOUND");
    }
  });
});
