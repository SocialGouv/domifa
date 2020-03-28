import { Test, TestingModule } from "@nestjs/testing";
import { ConfigService } from "../../config/config.service";
import { MailerService } from "./mailer.service";

describe("MailerService", () => {
  let service: MailerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MailerService, ConfigService],
    }).compile();

    service = module.get<MailerService>(MailerService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
