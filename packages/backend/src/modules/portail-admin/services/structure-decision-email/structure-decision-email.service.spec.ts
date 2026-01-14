import { Test, TestingModule } from "@nestjs/testing";
import { StructureDecisionEmailService } from "./structure-decision-email.service";
import { FileManagerService } from "../../../../util";
import { MailsModule } from "../../../mails/mails.module";

describe("StructureDecisionEmailService", () => {
  let service: StructureDecisionEmailService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StructureDecisionEmailService, FileManagerService],
      imports: [MailsModule],
    }).compile();

    service = module.get<StructureDecisionEmailService>(
      StructureDecisionEmailService
    );
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
