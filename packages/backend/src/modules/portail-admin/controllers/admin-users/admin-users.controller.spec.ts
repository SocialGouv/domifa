import { Test, TestingModule } from "@nestjs/testing";
import { AdminUsersController } from "./admin-users.controller";
import { forwardRef } from "@nestjs/common";
import { UsagersModule } from "../../../../usagers/usagers.module";
import { AppLogsService } from "../../../app-logs/app-logs.service";
import { InteractionsModule } from "../../../interactions/interactions.module";
import { SmsModule } from "../../../sms/sms.module";
import { StructuresModule } from "../../../structures/structure.module";
import { UsersModule } from "../../../users/users.module";
import { AdminStructuresService } from "../../services";
import { AdminSuperivorUsersService } from "../../services/admin-superivor-users/admin-superivor-users.service";

describe("AdminUsersController", () => {
  let controller: AdminUsersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminUsersController],
      imports: [
        forwardRef(() => UsersModule),
        forwardRef(() => StructuresModule),
        forwardRef(() => UsagersModule),
        forwardRef(() => InteractionsModule),
        forwardRef(() => SmsModule),
      ],
      providers: [
        AdminStructuresService,
        AppLogsService,
        AdminSuperivorUsersService,
      ],
    }).compile();

    controller = module.get<AdminUsersController>(AdminUsersController);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });
});
