import { AuthService } from "../auth/auth.service";
import { usagerRepository } from "../database";
import { UsagersModule } from "../usagers/usagers.module";
import { UsersModule } from "../users/users.module";
import { AppTestContext, AppTestHelper } from "../util/test";
import { SmsModule } from "./../sms/sms.module";
import { InteractionsController } from "./interactions.controller";
import { InteractionDto } from "./interactions.dto";
import { InteractionsService } from "./interactions.service";

describe("Interactions Controller", () => {
  let controller: InteractionsController;
  let authService: AuthService;

  let context: AppTestContext;

  beforeAll(async () => {
    context = await AppTestHelper.bootstrapTestApp({
      controllers: [InteractionsController],
      imports: [UsersModule, UsagersModule, SmsModule],
      providers: [InteractionsService],
    });

    controller = context.module.get<InteractionsController>(
      InteractionsController
    );
    authService = context.module.get<AuthService>(AuthService);
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
