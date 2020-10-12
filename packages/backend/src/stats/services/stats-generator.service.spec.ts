import { forwardRef } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { DatabaseModule } from "../../database/database.module";
import { InteractionsModule } from "../../interactions/interactions.module";
import { StructuresModule } from "../../structures/structure.module";
import { UsagersModule } from "../../usagers/usagers.module";
import { UsersModule } from "../../users/users.module";
import { StatsProviders } from "../stats-providers";
import { StatsGeneratorService } from "./stats-generator.service";
import { DashboardService } from "./dashboard.service";

describe("StatsGeneratorService", () => {
  let service: StatsGeneratorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        DatabaseModule,
        forwardRef(() => UsersModule),
        forwardRef(() => StructuresModule),
        forwardRef(() => UsagersModule),
        forwardRef(() => InteractionsModule),
      ],
      providers: [DashboardService, StatsGeneratorService, ...StatsProviders],
    }).compile();

    service = module.get<StatsGeneratorService>(StatsGeneratorService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
