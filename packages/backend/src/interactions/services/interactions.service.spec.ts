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
});
