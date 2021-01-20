import { forwardRef } from "@nestjs/common";
import { DatabaseModule } from "../../database";
import { InteractionsModule } from "../../interactions/interactions.module";
import { StructuresModule } from "../../structures/structure.module";
import { UsagersModule } from "../../usagers/usagers.module";
import { UsersModule } from "../../users/users.module";
import { AppTestContext, AppTestHelper } from "../../util/test";
import { DashboardService } from "../services/dashboard.service";
import { StatsGeneratorService } from "../services/stats-generator.service";
import { StatsService } from "../services/stats.service";

import { StatsController } from "./stats.controller";

describe("Stats Controller", () => {
  let controller: StatsController;

  let context: AppTestContext;
  beforeAll(async () => {
    context = await AppTestHelper.bootstrapTestApp({
      controllers: [StatsController],
      imports: [
        DatabaseModule,
        forwardRef(() => UsersModule),
        forwardRef(() => StructuresModule),
        forwardRef(() => UsagersModule),
        forwardRef(() => InteractionsModule),
      ],
      providers: [StatsService, StatsGeneratorService, DashboardService],
    });
    controller = context.module.get<StatsController>(StatsController);
  });
  afterAll(async () => {
    await AppTestHelper.tearDownTestApp(context);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });
});
