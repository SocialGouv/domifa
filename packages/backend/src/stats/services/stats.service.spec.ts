import { forwardRef, HttpStatus, INestApplication } from "@nestjs/common";

import { DatabaseModule } from "../../database";
import { InteractionsModule } from "../../interactions/interactions.module";
import { StructuresModule } from "../../structures/structure.module";
import { UsagersModule } from "../../usagers/usagers.module";
import { UsersModule } from "../../users/users.module";
import { AppTestContext, AppTestHelper } from "../../util/test";

import { DashboardService } from "./dashboard.service";
import { StatsGeneratorService } from "./stats-generator.service";
import { StatsService } from "./stats.service";

import * as request from "supertest";
import { StructuresService } from "../../structures/services/structures.service";

describe("StatsService", () => {
  let service: StatsService;
  let structureService: StructuresService;

  let app: INestApplication;
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

    app = context.module.createNestApplication();

    service = context.module.get<StatsService>(StatsService);
    structureService = context.module.get<StructuresService>(StructuresService);

    await app.init();
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

    const structure = await structureService.findOne(1);

    const newStat = await service.getStatsDiff({
      structure,
      startDate: new Date("2020-01-01"),
      endDate: new Date("2020-12-30"),
    });

    expect(newStat).toBeDefined();
    expect(newStat.stats).toBeDefined();
    expect(newStat.stats.generated).toBeTruthy();
    expect(newStat.stats.date).toBeTruthy();

    // 3. On vérifie qu'il est là

    // 4. On vérifie le contenu
  });
});
