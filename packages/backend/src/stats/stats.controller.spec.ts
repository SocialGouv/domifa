import { Test, TestingModule } from "@nestjs/testing";
import { StatsController } from "./stats.controller";

describe("Stats Controller", () => {
  let controller: StatsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StatsController]
    }).compile();

    controller = module.get<StatsController>(StatsController);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });
});
