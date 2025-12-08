import { Test, TestingModule } from "@nestjs/testing";
import { StructureDecisionService } from "./structure-decision.service";
import { FileManagerService } from "../../../../util";
import { MailsModule } from "../../../mails/mails.module";

describe("StructureDecisionService", () => {
  let service: StructureDecisionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StructureDecisionService, FileManagerService],
      imports: [MailsModule],
    }).compile();

    service = module.get<StructureDecisionService>(StructureDecisionService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
