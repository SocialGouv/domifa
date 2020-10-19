import { forwardRef, Module, HttpModule } from "@nestjs/common";
import { ConfigService } from "../config/config.service";

import { DatabaseModule } from "../database/database.module";
import { InteractionsModule } from "../interactions/interactions.module";
import { UsagersModule } from "../usagers/usagers.module";
import { UsersModule } from "../users/users.module";
import { StructuresProviders } from "./structures-providers";
import { StructuresController } from "./structures.controller";

import { StructuresService } from "./services/structures.service";

import { MailsModule } from "../mails/mails.module";

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
  providers: [StructuresService, ...StructuresProviders, ConfigService],
})
export class StructuresModule {}
