import { forwardRef } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { DatabaseModule } from "../../database/database.module";
import { InteractionsModule } from "../../interactions/interactions.module";
import { StructuresModule } from "../../structures/structure.module";
import { UsagersModule } from "../../usagers/usagers.module";
import { UsersModule } from "../../users/users.module";
import { StatsProviders } from "../stats-providers";
import { StatsController } from "./stats.controller";
import { StatsGeneratorService } from "../services/stats-generator.service";
import { StatsService } from "../services/stats.service";

describe("Stats Controller", () => {
  let controller: StatsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StatsController],
      imports: [
        DatabaseModule,
        forwardRef(() => UsersModule),
        forwardRef(() => StructuresModule),
        forwardRef(() => UsagersModule),
        forwardRef(() => InteractionsModule),
      ],
      providers: [StatsService, StatsGeneratorService, ...StatsProviders],
    }).compile();

    controller = module.get<StatsController>(StatsController);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });
});
