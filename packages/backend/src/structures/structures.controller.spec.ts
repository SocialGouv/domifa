import { Test, TestingModule } from "@nestjs/testing";
import { StructuresController } from "./structures.controller";
import { StructuresService } from "./structures.service";

describe("Stuctures Controller", () => {
  it("should be defined", async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StructuresController],
      providers: [{ provide: StructuresService, useValue: {} }]
    }).compile();

    const controller = module.get<StructuresController>(StructuresController);
    expect(controller).toBeDefined();
  });
});
