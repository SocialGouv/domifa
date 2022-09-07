import { HttpModule } from "@nestjs/axios";
import { forwardRef, Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";

import { SmsModule } from "../sms/sms.module";
import { StructuresModule } from "../structures/structure.module";
import { UsagersModule } from "../usagers/usagers.module";
import { UsersModule } from "../users/users.module";
import { InteractionsController } from "./interactions.controller";
import { InteractionsDeletor, InteractionsService } from "./services";

@Module({
  controllers: [InteractionsController],
  exports: [InteractionsService, InteractionsDeletor],
  imports: [
    HttpModule,
    forwardRef(() => UsersModule),
    forwardRef(() => UsagersModule),
    forwardRef(() => StructuresModule),
    forwardRef(() => SmsModule),
    forwardRef(() => AuthModule),
  ],
  providers: [InteractionsService, InteractionsDeletor],
})
export class InteractionsModule {}
