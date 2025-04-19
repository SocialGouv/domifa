import { forwardRef } from "@nestjs/common";
import { UsagersModule } from "../../../usagers/usagers.module";
import { AppTestContext, AppTestHelper } from "../../../util/test";
import { AppLogsService } from "../../app-logs/app-logs.service";
import { InteractionsModule } from "../../interactions/interactions.module";
import { StructuresModule } from "../../structures/structure.module";
import { UsersModule } from "../../users/users.module";
import { StatsPrivateController } from "./stats.private.controller";

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
