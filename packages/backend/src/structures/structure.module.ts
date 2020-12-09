import { forwardRef, HttpModule, Module } from "@nestjs/common";
import { DatabaseModule } from "../database";
import { InteractionsModule } from "../interactions/interactions.module";
import { MailsModule } from "../mails/mails.module";
import { StatsModule } from "../stats/stats.module";
import { UsagersModule } from "../usagers/usagers.module";
import { UsersModule } from "../users/users.module";
import { StructuresService } from "./services/structures.service";
import { StructuresProviders } from "./structures-providers";
import { StructuresController } from "./controllers/structures.controller";
import { StructureDocController } from "./controllers/structure-doc.controller";
import { StructureDocService } from "./services/structure-doc.service";

@Module({
  controllers: [StructuresController, StructureDocController],
  exports: [StructuresService, StructureDocService, ...StructuresProviders],
  imports: [
    DatabaseModule,
    HttpModule,
    forwardRef(() => MailsModule),
    forwardRef(() => UsersModule),
    forwardRef(() => UsagersModule),
    forwardRef(() => StatsModule),
    forwardRef(() => InteractionsModule),
  ],
  providers: [StructuresService, StructureDocService, ...StructuresProviders],
})
export class StructuresModule {}
