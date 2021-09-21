import { forwardRef } from "@nestjs/common";
import { InteractionsModule } from "../../interactions/interactions.module";
import { StructuresModule } from "../../structures/structure.module";
import { UsagersModule } from "../../usagers/usagers.module";
import { UsersModule } from "../../users/users.module";
import { AppTestContext, AppTestHelper } from "../../util/test";
import { DashboardService } from "../services/dashboard.service";
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
      providers: [DashboardService],
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
