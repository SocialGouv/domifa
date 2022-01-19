import { forwardRef, Module } from "@nestjs/common";

import { InteractionsModule } from "../../interactions/interactions.module";
import { StructuresModule } from "../../structures/structure.module";
import { UsagersModule } from "../../usagers/usagers.module";
import { UsersModule } from "../../users/users.module";
import { SmsModule } from "../../sms/sms.module";
import { AdminSmsController } from "./controllers/admin-sms.controller";
import { AdminSmsService } from "./services";

@Module({
  controllers: [AdminSmsController],
  exports: [AdminSmsService],
  imports: [
    forwardRef(() => UsersModule),
    forwardRef(() => StructuresModule),
    forwardRef(() => UsagersModule),
    forwardRef(() => InteractionsModule),
    forwardRef(() => SmsModule),
  ],
  providers: [AdminSmsService],
})
export class AdminSmsModule {}
