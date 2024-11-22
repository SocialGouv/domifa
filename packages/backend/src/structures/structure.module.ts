import { HttpModule } from "@nestjs/axios";
import { forwardRef, Module } from "@nestjs/common";

import { InteractionsModule } from "../modules/interactions/interactions.module";
import { StatsModule } from "../stats/stats.module";
import { UsagersModule } from "../usagers/usagers.module";
import { UsersModule } from "../users/users.module";
import { StructureDocController } from "./controllers/structure-doc.controller";
import { StructuresController } from "./controllers/structures.controller";
import { StructuresPublicController } from "./controllers/structures.public.controller";

import { StructureHardResetService } from "./services/structureHardReset.service";
import { StructuresService } from "./services/structures.service";
import { AppLogsService } from "../modules/app-logs/app-logs.service";
import { FileManagerService } from "../util/file-manager/file-manager.service";
import { MailsModule } from "../modules/mails/mails.module";

@Module({
  controllers: [
    StructuresController,
    StructuresPublicController,
    StructureDocController,
  ],
  exports: [StructuresService, StructureHardResetService],
  imports: [
    HttpModule,
    forwardRef(() => MailsModule),
    forwardRef(() => UsersModule),
    forwardRef(() => UsagersModule),
    forwardRef(() => StatsModule),
    forwardRef(() => InteractionsModule),
  ],
  providers: [
    StructuresService,
    StructureHardResetService,
    AppLogsService,
    FileManagerService,
  ],
})
export class StructuresModule {}
