import { forwardRef } from "@nestjs/common";
import { InteractionsModule } from "../../modules/interactions/interactions.module";
import { StructuresModule } from "../../structures/structure.module";
import { UsagersModule } from "../../usagers/usagers.module";
import { UsersModule } from "../../users/users.module";
import { AppTestContext, AppTestHelper } from "../../util/test";
import { StatsPrivateController } from "./stats.private.controller";
import { AppLogsService } from "../../modules/app-logs/app-logs.service";

describe("Stats Private Controller", () => {
  let controller: StatsPrivateController;

  let context: AppTestContext;
  beforeAll(async () => {
    context = await AppTestHelper.bootstrapTestApp({
      controllers: [StatsPrivateController],
      imports: [
        forwardRef(() => UsersModule),
        forwardRef(() => StructuresModule),
        forwardRef(() => UsagersModule),
        forwardRef(() => InteractionsModule),
      ],
      providers: [AppLogsService],
    });
    controller = context.module.get<StatsPrivateController>(
      StatsPrivateController
    );
  });
  afterAll(async () => {
    await AppTestHelper.tearDownTestApp(context);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });
});
