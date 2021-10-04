import { StructuresModule } from "../../structures/structure.module";
import { UsagersModule } from "../../usagers/usagers.module";
import { UsersModule } from "../../users/users.module";
import { AppTestContext, AppTestHelper } from "../../util/test";
import { InteractionsModule } from "../interactions.module";
import { InteractionsService } from "./interactions.service";

describe("InteractionsService", () => {
  let context: AppTestContext;

  let interactionsService: InteractionsService;

  beforeAll(async () => {
    context = await AppTestHelper.bootstrapTestApp({
      imports: [
        InteractionsModule,
        UsagersModule,
        UsersModule,
        StructuresModule,
      ],
      providers: [InteractionsService],
    });
    interactionsService =
      context.module.get<InteractionsService>(InteractionsService);
  });

  afterAll(async () => {
    await AppTestHelper.tearDownTestApp(context);
  });

  it("should be defined", () => {
    expect(interactionsService).toBeDefined();
  });

  it("should return results", async () => {
    // NOTE: on ne peut pas vérifier précisément les données de ce test tant qu'on isole pas les données de chaque test
    const results =
      await interactionsService.totalInteractionAllUsagersStructure({
        structureId: 1,
      });
    expect(results).toBeDefined();
  });
});
