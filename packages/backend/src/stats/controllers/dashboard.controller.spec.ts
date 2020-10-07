import { forwardRef } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { DatabaseModule } from "../../database/database.module";
import { InteractionsModule } from "../../interactions/interactions.module";
import { StructuresModule } from "../../structures/structure.module";
import { UsagersModule } from "../../usagers/usagers.module";
import { UsersModule } from "../../users/users.module";
import { StatsProviders } from "../stats-providers";
import { DashboardController } from "./dashboard.controller";
import { StatsGeneratorService } from "../services/stats-generator.service";
import { DashboardService } from "../services/dashboard.service";
import { StatsService } from "../services/stats.service";
import { ConfigService } from "../../config";

describe("Dashboard Controller", () => {
  let controller: DashboardController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DashboardController],
      imports: [
        DatabaseModule,
        forwardRef(() => UsersModule),
        forwardRef(() => StructuresModule),
        forwardRef(() => UsagersModule),
        forwardRef(() => InteractionsModule),
      ],
      providers: [
        DashboardService,
        StatsService,
        StatsGeneratorService,
        ...StatsProviders,
        {
          provide: ConfigService,
          useValue: new ConfigService(),
        },
      ],
    }).compile();

    controller = module.get<DashboardController>(DashboardController);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });
});
