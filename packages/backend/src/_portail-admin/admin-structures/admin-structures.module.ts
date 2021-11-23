import { forwardRef, Module } from "@nestjs/common";
import { InteractionsModule } from "../../interactions/interactions.module";
import { SmsModule } from "../../sms/sms.module";
import { StructuresModule } from "../../structures/structure.module";
import { UsagersModule } from "../../usagers/usagers.module";
import { UsersModule } from "../../users/users.module";
import { AdminStructuresController } from "./controllers/admin-structures.controller";
import { AdminStructuresService } from "./services";

@Module({
  controllers: [AdminStructuresController],
  exports: [AdminStructuresService],
  imports: [
    forwardRef(() => UsersModule),
    forwardRef(() => StructuresModule),
    forwardRef(() => UsagersModule),
    forwardRef(() => InteractionsModule),
    forwardRef(() => SmsModule),
  ],
  providers: [AdminStructuresService],
})
export class AdminStructuresModule {}
