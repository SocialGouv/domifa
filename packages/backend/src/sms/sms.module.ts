import { forwardRef, Module } from "@nestjs/common";
import { DatabaseModule } from "../database";
import { StructuresModule } from "../structures/structure.module";
import { UsagersModule } from "../usagers/usagers.module";
import { UsersModule } from "../users/users.module";
import { SmsService } from "./services/sms.service";

import { SmsController } from "./sms.controller";

@Module({
  controllers: [SmsController],
  exports: [SmsService],
  imports: [
    DatabaseModule,
    forwardRef(() => StructuresModule),
    forwardRef(() => UsagersModule),
  ],
  providers: [SmsService],
})
export class SmsModule {}
