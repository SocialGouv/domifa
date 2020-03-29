import { Test, TestingModule } from "@nestjs/testing";
import { SearchController } from "./search.controller";
import { DatabaseModule } from "../../database/database.module";
import { forwardRef } from "@nestjs/common";
import { UsersModule } from "../../users/users.module";
import { StructuresModule } from "../../structures/structure.module";
import { UsagersModule } from "../usagers.module";
import { InteractionsModule } from "../../interactions/interactions.module";
import { StatsService } from "../../stats/stats.service";
import { StatsProviders } from "../../stats/stats-providers";

describe("Search Controller", () => {
  let controller: SearchController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SearchController],
      imports: [
        DatabaseModule,
        forwardRef(() => UsersModule),
        forwardRef(() => StructuresModule),
        forwardRef(() => UsagersModule),
        forwardRef(() => InteractionsModule),
      ],
      providers: [StatsService, ...StatsProviders],
    }).compile();

    controller = module.get<SearchController>(SearchController);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });
});
