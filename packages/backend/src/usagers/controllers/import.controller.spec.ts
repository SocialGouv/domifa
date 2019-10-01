import { Test, TestingModule } from "@nestjs/testing";
import { ImportController } from "./import.controller";

describe("Import Controller", () => {
  let controller: ImportController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ImportController]
    }).compile();

    controller = module.get<ImportController>(ImportController);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });
});
