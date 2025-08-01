import { forwardRef } from "@nestjs/common";
import { InteractionsModule } from "../../../interactions/interactions.module";
import { StructuresModule } from "../../../structures/structure.module";
import { UsagersModule } from "../../../../usagers/usagers.module";
import { UsersModule } from "../../../users/users.module";
import { AppTestContext, AppTestHelper } from "../../../../util/test";
import { AdminStructuresDeleteController } from "./admin-structures-delete.controller";
import { FileManagerService } from "../../../../util/file-manager/file-manager.service";
import { AppLogsService } from "../../../app-logs/app-logs.service";

describe("Dashboard AdminStructuresDeleteController", () => {
  let controller: AdminStructuresDeleteController;
  let appLogService: AppLogsService;
  let context: AppTestContext;
  beforeAll(async () => {
    appLogService = {
      create: jest.fn(),
    };
    context = await AppTestHelper.bootstrapTestApp({
      controllers: [AdminStructuresDeleteController],
      imports: [
        forwardRef(() => UsersModule),
        forwardRef(() => StructuresModule),
        forwardRef(() => UsagersModule),
        forwardRef(() => InteractionsModule),
      ],
      providers: [
        FileManagerService,
        {
          provide: AppLogsService,
          useValue: appLogService,
        },
      ],
    });
    controller = context.module.get<AdminStructuresDeleteController>(
      AdminStructuresDeleteController
    );
  });
  afterAll(async () => {
    await AppTestHelper.tearDownTestApp(context);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });
});
