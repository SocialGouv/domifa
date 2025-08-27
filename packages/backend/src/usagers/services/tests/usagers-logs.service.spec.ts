import { Test, TestingModule } from "@nestjs/testing";
import { UsagersLogsService } from "../usagers-logs.service";

describe("UsagersLogsService", () => {
  let service: UsagersLogsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsagersLogsService],
    }).compile();

    service = module.get<UsagersLogsService>(UsagersLogsService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
