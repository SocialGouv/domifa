import { Test, TestingModule } from "@nestjs/testing";
import { StructureDecisionService } from "./structure-decision.service";

describe("StructureDecisionService", () => {
  let service: StructureDecisionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StructureDecisionService],
    }).compile();

    service = module.get<StructureDecisionService>(StructureDecisionService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
