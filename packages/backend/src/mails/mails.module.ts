import { forwardRef, Module, HttpModule } from "@nestjs/common";
import { configService } from "../config/config.service";

import { DatabaseModule } from "../database/database.module";
import { InteractionsModule } from "../interactions/interactions.module";
import { UsagersModule } from "../usagers/usagers.module";
import { UsersModule } from "../users/users.module";

import { StructuresMailsService } from "../mails/services/structures-mails.service";
import { DomifaMailsService } from "./services/domifa-mails.service";

import { StructuresModule } from "../structures/structure.module";
import { UsagersMailsService } from "./services/usagers-mails.service";
import { UsersMailsService } from "./services/users-mails.service";

@Module({
  controllers: [],
  exports: [
    StructuresMailsService,
    DomifaMailsService,
    UsagersMailsService,
    UsersMailsService,
  ],
  providers: [
    StructuresMailsService,
    DomifaMailsService,
    UsagersMailsService,
    UsersMailsService,
  ],
  imports: [
    DatabaseModule,
    HttpModule,
    forwardRef(() => StructuresModule),
    forwardRef(() => UsersModule),
    forwardRef(() => UsagersModule),
    forwardRef(() => InteractionsModule),
  ],
})
export class MailsModule {}
