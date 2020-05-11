import { Test, TestingModule } from "@nestjs/testing";
import { ConfigService } from "../../config/config.service";
import { MailJetService } from "./mailjet.service";

describe("MailJetService", () => {
  let service: MailJetService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MailJetService, ConfigService],
    }).compile();

    service = module.get<MailJetService>(MailJetService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
