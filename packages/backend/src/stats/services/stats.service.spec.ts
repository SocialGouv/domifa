import { forwardRef, INestApplication } from "@nestjs/common";
import { InteractionsModule } from "../../interactions/interactions.module";
import { StructuresService } from "../../structures/services/structures.service";
import { StructuresModule } from "../../structures/structure.module";
import { UsagersModule } from "../../usagers/usagers.module";
import { UsersModule } from "../../users/users.module";
import { AppTestContext, AppTestHelper } from "../../util/test";
import { DashboardService } from "./dashboard.service";
import { StatsGeneratorService } from "./stats-generator.service";
import { StatsService } from "./stats.service";

describe("StatsService", () => {
  let service: StatsService;
  let structureService: StructuresService;

  let app: INestApplication;
  let context: AppTestContext;

  beforeAll(async () => {
    context = await AppTestHelper.bootstrapTestApp({
      imports: [
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
});
