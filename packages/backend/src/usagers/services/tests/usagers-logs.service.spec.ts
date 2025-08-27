import { UsagersLogsService } from "../usagers-logs.service";
import { AppLogsService } from "../../../modules/app-logs/app-logs.service";
import { forwardRef } from "@nestjs/common";
import { UsersModule } from "../../../modules/users/users.module";
import { AppTestContext, AppTestHelper } from "../../../util/test";
import { UsagerHistoryStateService } from "../usagerHistoryState.service";
import { UsagersService } from "../usagers.service";

describe("UsagersLogsService", () => {
  let service: UsagersLogsService;
  let context: AppTestContext;

  beforeAll(async () => {
    context = await AppTestHelper.bootstrapTestApp({
      imports: [forwardRef(() => UsersModule)],
      providers: [UsagersService, UsagerHistoryStateService, AppLogsService],
    });
    service = context.module.get<UsagersLogsService>(UsagersLogsService);
  });
  afterAll(async () => {
    await AppTestHelper.tearDownTestApp(context);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
