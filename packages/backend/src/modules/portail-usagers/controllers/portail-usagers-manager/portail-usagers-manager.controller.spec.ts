import { Test, TestingModule } from "@nestjs/testing";
import { PortailUsagersManagerController } from "./portail-usagers-manager.controller";
import { AppLogsService } from "../../../app-logs/app-logs.service";
import { OtpModule } from "../../../otp/otp.module";

describe("PortailUsagersManagerController", () => {
  let controller: PortailUsagersManagerController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PortailUsagersManagerController],
      imports: [OtpModule],
      providers: [AppLogsService],
    }).compile();

    controller = module.get<PortailUsagersManagerController>(
      PortailUsagersManagerController
    );
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });
});
