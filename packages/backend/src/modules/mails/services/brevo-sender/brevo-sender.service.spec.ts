import { Test, TestingModule } from "@nestjs/testing";
import { BrevoSenderService } from "./brevo-sender.service";

describe("BrevoSenderService", () => {
  let service: BrevoSenderService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BrevoSenderService],
    }).compile();

    service = module.get<BrevoSenderService>(BrevoSenderService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
