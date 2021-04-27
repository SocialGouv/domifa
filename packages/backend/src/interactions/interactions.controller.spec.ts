import { AuthService } from "../auth/auth.service";
import { usagerRepository } from "../database";
import { UsagersModule } from "../usagers/usagers.module";
import { UsersModule } from "../users/users.module";
import { AppTestContext, AppTestHelper } from "../util/test";
import { AppAuthUser, UsagerLight } from "../_common/model";
import { SmsModule } from "./../sms/sms.module";
import { InteractionsController } from "./interactions.controller";
import { InteractionDto } from "./interactions.dto";
import { InteractionsService } from "./interactions.service";

describe("Interactions Controller", () => {
  let controller: InteractionsController;
  let authService: AuthService;

  let context: AppTestContext;
  let user: AppAuthUser;
  let usager: UsagerLight;

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

    user = await authService.findAuthUser({ id: 2, structureId: 1 });

    usager = await usagerRepository.findOne({
      ref: 1,
      structureId: 1,
    });
    expect(user).toBeDefined();
  });

  afterAll(async () => {
    await AppTestHelper.tearDownTestApp(context);
  });

  it("Component should be defined", () => {
    expect(controller).toBeDefined();
  });

  it("User && Usage should be defined", () => {
    expect(user).toBeDefined();
    expect(usager).toBeDefined();
  });

  it("postInteraction ", async () => {
    const interaction = new InteractionDto();
    interaction.type = "courrierOut";
    interaction.content = "Les impôts";

    const testFc = await controller.postInteractions(
      [interaction],
      user,
      usager
    );
    expect(testFc).toBeDefined();
  });

  it("POST : colis", async () => {
    // 4 Colis déjà enregistrés
    const interaction = new InteractionDto();
    interaction.type = "colisIn";
    interaction.nbCourrier = 12;
    interaction.content = "Un colis sympa";

    const testFc = await controller.postInteractions(
      [interaction],
      user,
      usager
    );
    expect(testFc).toBeDefined();
    expect(testFc.lastInteraction.enAttente).toBeTruthy();
    expect(testFc.lastInteraction.colisIn).toEqual(12);
  });
});
