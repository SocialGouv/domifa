import { forwardRef } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { DatabaseModule } from "../../database/database.module";
import { InteractionsModule } from "../../interactions/interactions.module";
import { StructuresModule } from "../../structures/structure.module";
import { UsagersModule } from "../../usagers/usagers.module";
import { UsersModule } from "../../users/users.module";
import { StatsProviders } from "../stats-providers";
import { StatsService } from "./stats.service";
import { DashboardService } from "./dashboard.service";

describe("StatsService", () => {
  let service: StatsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        DatabaseModule,
        forwardRef(() => UsersModule),
        forwardRef(() => StructuresModule),
        forwardRef(() => UsagersModule),
        forwardRef(() => InteractionsModule),
      ],
      providers: [DashboardService, StatsService, ...StatsProviders],
    }).compile();

    service = module.get<StatsService>(StatsService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
