import { forwardRef, HttpModule, Module } from "@nestjs/common";
import { DatabaseModule } from "../database/database.module";
import { InteractionsModule } from "../interactions/interactions.module";
import { MailsModule } from "../mails/mails.module";
import { UsagersModule } from "../usagers/usagers.module";
import { UsersModule } from "../users/users.module";
import { StructuresService } from "./services/structures.service";
import { StructuresProviders } from "./structures-providers";
import { StructuresController } from "./structures.controller";

@Module({
  controllers: [StructuresController],
  exports: [StructuresService, ...StructuresProviders],
  imports: [
    DatabaseModule,
    HttpModule,
    forwardRef(() => MailsModule),
    forwardRef(() => UsersModule),
    forwardRef(() => UsagersModule),
    forwardRef(() => InteractionsModule),
  ],
  providers: [StructuresService, ...StructuresProviders],
})
export class StructuresModule {}
