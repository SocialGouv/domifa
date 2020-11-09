import { forwardRef } from "@nestjs/common";
import { DatabaseModule } from "../../database/database.module";
import { InteractionsModule } from "../../interactions/interactions.module";
import { StatsGeneratorService } from "../../stats/services/stats-generator.service";
import { StatsService } from "../../stats/services/stats.service";
import { StatsProviders } from "../../stats/stats-providers";
import { StructuresModule } from "../../structures/structure.module";
import { UsersModule } from "../../users/users.module";
import { AppTestContext, AppTestHelper } from "../../util/test";
import { UsagersModule } from "../usagers.module";
import { SearchController } from "./search.controller";

describe("Search Controller", () => {
  let controller: SearchController;

  let context: AppTestContext;

  beforeAll(async () => {
    context = await AppTestHelper.bootstrapTestApp({
      controllers: [SearchController],
      imports: [
        DatabaseModule,
        forwardRef(() => UsersModule),
        forwardRef(() => StructuresModule),
        forwardRef(() => UsagersModule),
        forwardRef(() => InteractionsModule),
      ],
      providers: [StatsService, StatsGeneratorService, ...StatsProviders],
    });
    controller = context.module.get<SearchController>(SearchController);
  });
  afterAll(async () => {
    await AppTestHelper.tearDownTestApp(context);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });
});
