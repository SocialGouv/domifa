import { Test, TestingModule } from "@nestjs/testing";
import { StructureInformationController } from "./structure-information.controller";

describe("StructureInformationController", () => {
  let controller: StructureInformationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StructureInformationController],
    }).compile();

    controller = module.get<StructureInformationController>(
      StructureInformationController
    );
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });
});
