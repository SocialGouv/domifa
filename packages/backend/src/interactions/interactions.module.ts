import { forwardRef, Module } from "@nestjs/common";
import { MessageSmsService } from "../sms/services/message-sms.service";
import { SmsModule } from "../sms/sms.module";
import { StructuresModule } from "../structures/structure.module";
import { UsagersModule } from "../usagers/usagers.module";
import { UsersModule } from "../users/users.module";
import { InteractionsController } from "./interactions.controller";
import { InteractionsService } from "./interactions.service";

@Module({
  controllers: [InteractionsController],
  exports: [InteractionsService],
  imports: [
    forwardRef(() => UsersModule),
    forwardRef(() => UsagersModule),
    forwardRef(() => StructuresModule),
    forwardRef(() => SmsModule),
  ],
  providers: [InteractionsService, MessageSmsService],
})
export class InteractionsModule {}
