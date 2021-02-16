import { forwardRef } from "@nestjs/common";
import { DatabaseModule } from "../../database";
import { InteractionsModule } from "../../interactions/interactions.module";
import { StructuresModule } from "../../structures/structure.module";
import { UsagersModule } from "../../usagers/usagers.module";
import { UsersModule } from "../../users/users.module";
import { AppTestContext, AppTestHelper } from "../../util/test";

import { DashboardService } from "./dashboard.service";
import { StatsGeneratorService } from "./stats-generator.service";
import { StatsService } from "./stats.service";

describe("StatsService", () => {
  let service: StatsService;

  let context: AppTestContext;
  beforeAll(async () => {
    context = await AppTestHelper.bootstrapTestApp({
      imports: [
        DatabaseModule,
        forwardRef(() => UsersModule),
        forwardRef(() => StructuresModule),
        forwardRef(() => UsagersModule),
        forwardRef(() => InteractionsModule),
      ],
      providers: [DashboardService, StatsGeneratorService, StatsService],
    });
    service = context.module.get<StatsService>(StatsService);
  });
  afterAll(async () => {
    await AppTestHelper.tearDownTestApp(context);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  it("1. Get by date", async () => {
    // 1. Fichier stat undefined
    expect(await service.getByDate(1, new Date("2020-12-30"))).toBeUndefined();

    // 2. On génère le fichier

    // 3. On vérifie qu'il est là

    // 4. On vérifie le contenu
  });
});
