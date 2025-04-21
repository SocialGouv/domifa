import { Test, TestingModule } from "@nestjs/testing";
import { NationalStatsController } from "./national-stats.controller";
import { forwardRef } from "@nestjs/common";
import { UsagersModule } from "../../../../usagers/usagers.module";
import { AppLogsService } from "../../../app-logs/app-logs.service";
import { InteractionsModule } from "../../../interactions/interactions.module";
import { SmsModule } from "../../../sms/sms.module";
import { StructuresModule } from "../../../structures/structure.module";
import { UsersModule } from "../../../users/users.module";
import { AdminStructuresService } from "../../services";

describe("NationalStatsController", () => {
  let controller: NationalStatsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NationalStatsController],
      imports: [
        forwardRef(() => UsersModule),
        forwardRef(() => StructuresModule),
        forwardRef(() => UsagersModule),
        forwardRef(() => InteractionsModule),
        forwardRef(() => SmsModule),
      ],
      providers: [AdminStructuresService, AppLogsService],
    }).compile();

    controller = module.get<NationalStatsController>(NationalStatsController);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });
});
