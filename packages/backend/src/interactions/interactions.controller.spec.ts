import { forwardRef } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { StructuresAuthService } from "../auth/services";
import { usagerRepository } from "../database";
import { SmsModule } from "../sms/sms.module";
import { StructuresModule } from "../structures/structure.module";
import { UsagersModule } from "../usagers/usagers.module";
import { UsersModule } from "../users/users.module";
import { AppTestContext, AppTestHelper } from "../util/test";
import { UserStructureAuthenticated } from "../_common/model";
import { InteractionDto } from "./dto";
import { InteractionsController } from "./interactions.controller";

import { InteractionsModule } from "./interactions.module";
import { Usager } from "@domifa/common";

describe("Interactions Controller", () => {
  let controller: InteractionsController;
  let structureAuthService: StructuresAuthService;

  let context: AppTestContext;
  let user: UserStructureAuthenticated;
  let usager: Usager;

  beforeAll(async () => {
    context = await AppTestHelper.bootstrapTestApp({
      controllers: [],
      imports: [
        InteractionsModule,
        forwardRef(() => UsersModule),
        forwardRef(() => UsagersModule),
        forwardRef(() => StructuresModule),
        forwardRef(() => SmsModule),
        forwardRef(() => AuthModule),
      ],
      providers: [],
    });

    controller = context.module.get<InteractionsController>(
      InteractionsController
    );

    structureAuthService = context.module.get<StructuresAuthService>(
      StructuresAuthService
    );

    user = await structureAuthService.findAuthUser({
      _userId: 2,
      _userProfile: "structure",
      isSuperAdminDomifa: false,
    });

    usager = await usagerRepository.findOneBy({
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
    // 4 Colis déjà enregistrés en base
    const nbCourrierBefore = 4;
    const nbCourrierToAdd = 12;
    const interaction = new InteractionDto();
    interaction.type = "colisIn";
    interaction.nbCourrier = nbCourrierToAdd;
    interaction.content = "Un colis sympa";

    const testFc = await controller.postInteractions(
      [interaction],
      user,
      usager
    );
    expect(testFc).toBeDefined();
    expect(testFc.lastInteraction.enAttente).toBeTruthy();
    expect(testFc.lastInteraction.colisIn).toEqual(
      nbCourrierToAdd + nbCourrierBefore
    );
  });
});
