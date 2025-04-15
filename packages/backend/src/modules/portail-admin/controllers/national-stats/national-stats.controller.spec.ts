import { Test, TestingModule } from "@nestjs/testing";
import { NationalStatsController } from "./national-stats.controller";

describe("NationalStatsController", () => {
  let controller: NationalStatsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NationalStatsController],
    }).compile();

    controller = module.get<NationalStatsController>(NationalStatsController);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });
});
