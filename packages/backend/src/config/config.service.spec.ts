import { Test, TestingModule } from "@nestjs/testing";
import { configService } from "./config.service";

describe("ConfigService", () => {
  beforeEach(async () => { });

  it("should be defined", () => {
    expect(configService).toBeDefined();
  });
});
