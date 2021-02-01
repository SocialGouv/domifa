import { AuthService } from "../auth/auth.service";
import { DatabaseModule, usagerRepository } from "../database";
import { UsagersService } from "../usagers/services/usagers.service";
import { UsagersModule } from "../usagers/usagers.module";
import { UsersService } from "../users/services/users.service";
import { UsersModule } from "../users/users.module";
import { AppTestContext, AppTestHelper } from "../util/test";
import { InteractionsController } from "./interactions.controller";
import { InteractionDto } from "./interactions.dto";
import { InteractionsService } from "./interactions.service";

describe("Interactions Controller", () => {
  let controller: InteractionsController;
  let userService: UsersService;
  let authService: AuthService;
  let usagerService: UsagersService;

  let context: AppTestContext;

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
  });

  afterAll(async () => {
    await AppTestHelper.tearDownTestApp(context);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  it("postInteraction ", async () => {
    const interaction = new InteractionDto();
    interaction.type = "courrierOut";
    interaction.content = "Les impôts";
    const user = await authService.findAuthUser({ id: 2, structureId: 1 });
    expect(user).toBeDefined();
    const usager = await usagerRepository.findOne({
      ref: 1,
      structureId: 1,
    });
    expect(usager).toBeDefined();

    const testFc = await controller.postInteraction(interaction, user, usager);
    expect(testFc).toBeDefined();
  });
});
