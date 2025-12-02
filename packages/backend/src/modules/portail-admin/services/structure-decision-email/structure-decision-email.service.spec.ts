import { Test, TestingModule } from "@nestjs/testing";
import { StructureDecisionEmailService } from "./structure-decision-email.service";

describe("StructureDecisionEmailService", () => {
  let service: StructureDecisionEmailService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StructureDecisionEmailService],
    }).compile();

    service = module.get<StructureDecisionEmailService>(
      StructureDecisionEmailService
    );
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
