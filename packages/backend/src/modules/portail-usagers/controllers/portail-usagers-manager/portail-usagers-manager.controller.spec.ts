import { Test, TestingModule } from "@nestjs/testing";
import { PortailUsagersManagerController } from "./portail-usagers-manager.controller";

describe("PortailUsagersManagerController", () => {
  let controller: PortailUsagersManagerController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PortailUsagersManagerController],
    }).compile();

    controller = module.get<PortailUsagersManagerController>(
      PortailUsagersManagerController
    );
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });
});
