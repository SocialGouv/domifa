import { forwardRef } from "@nestjs/common";
import { InteractionsModule } from "../../../interactions/interactions.module";
import { SmsModule } from "../../../sms/sms.module";
import { StructuresModule } from "../../../structures/structure.module";
import { UsagersModule } from "../../../usagers/usagers.module";
import { UsersModule } from "../../../users/users.module";
import { AppTestContext, AppTestHelper } from "../../../util/test";
import { AdminStructuresService } from "../services/admin-structures.service";
import { AdminStructuresController } from "./admin-structures.controller";

describe("Dashboard AdminStructuresController", () => {
  let controller: AdminStructuresController;

  let context: AppTestContext;
  beforeAll(async () => {
    context = await AppTestHelper.bootstrapTestApp({
      controllers: [AdminStructuresController],
      imports: [
        forwardRef(() => UsersModule),
        forwardRef(() => StructuresModule),
        forwardRef(() => UsagersModule),
        forwardRef(() => InteractionsModule),
        forwardRef(() => SmsModule),
      ],
      providers: [AdminStructuresService],
    });
    controller = context.module.get<AdminStructuresController>(
      AdminStructuresController
    );
  });
  afterAll(async () => {
    await AppTestHelper.tearDownTestApp(context);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });
});
