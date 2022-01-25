import { Test, TestingModule } from "@nestjs/testing";
import { ContactSupportService } from "./contact-support.service";

describe("ContactSupportService", () => {
  let service: ContactSupportService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ContactSupportService],
    }).compile();

    service = module.get<ContactSupportService>(ContactSupportService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
