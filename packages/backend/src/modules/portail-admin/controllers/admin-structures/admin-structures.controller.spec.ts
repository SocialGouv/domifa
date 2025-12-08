import { forwardRef } from "@nestjs/common";
import { InteractionsModule } from "../../../interactions/interactions.module";
import { AppLogsService } from "../../../app-logs/app-logs.service";
import { StructuresModule } from "../../../structures/structure.module";
import { UsagersModule } from "../../../../usagers/usagers.module";
import { UsersModule } from "../../../users/users.module";
import { AppTestContext, AppTestHelper } from "../../../../util/test";
import { AdminStructuresService } from "../../services/admin-structures.service";
import { AdminStructuresController } from "./admin-structures.controller";
import { SmsModule } from "../../../sms/sms.module";
import { MailsModule } from "../../../mails/mails.module";
import { StructureDecisionService } from "../../services/structure-decision/structure-decision.service";
import { FileManagerService } from "../../../../util";
import { StructureDecisionEmailService } from "../../services/structure-decision-email/structure-decision-email.service";

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
        forwardRef(() => MailsModule),
        forwardRef(() => SmsModule),
      ],
      providers: [
        AdminStructuresService,
        AppLogsService,
        StructureDecisionService,
        FileManagerService,
        StructureDecisionEmailService,
      ],
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
