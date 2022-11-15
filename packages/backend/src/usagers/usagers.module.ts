import { HttpModule } from "@nestjs/axios";
import { forwardRef, Module } from "@nestjs/common";

import { InteractionsModule } from "../interactions/interactions.module";
import { MailsModule } from "../mails/mails.module";
import { StatsModule } from "../stats/stats.module";
import { StructuresModule } from "../structures/structure.module";
import { UsersModule } from "../users/users.module";
import { AgendaController } from "./controllers/agenda.controller";
import { UsagerDocsController } from "./controllers/usager-docs.controller";
import { ExportStructureUsagersController } from "./controllers/export-structure-usagers.controller";
import { ImportController } from "./controllers/import/import.controller";
import { UsagerNoteController } from "./controllers/usager-note.controller";
import { UsagerStructureDocsController } from "./controllers/usager-structure-docs.controller";
import { UsagersDecisionController } from "./controllers/usagers-decision.controller";
import { UsagersController } from "./controllers/usagers.controller";
import { UsagerOptionsController } from "./controllers/usager-options.controller";

import { UsagersService } from "./services/usagers.service";
import { UsagerOptionsHistoryService } from "./services/usagerOptionsHistory.service";
import { AppLogsModule } from "../modules/app-logs/app-logs.module";

@Module({
  controllers: [
    UsagersController,
    ImportController,
    AgendaController,
    UsagerNoteController,
    UsagersDecisionController,
    UsagerStructureDocsController,
    UsagerDocsController,
    ExportStructureUsagersController,
    UsagerOptionsController,
  ],
  exports: [UsagersService],
  imports: [
    HttpModule,
    forwardRef(() => MailsModule),
    forwardRef(() => StructuresModule),
    forwardRef(() => StatsModule),
    forwardRef(() => UsersModule),
    forwardRef(() => InteractionsModule),
    forwardRef(() => AppLogsModule),
  ],
  providers: [UsagersService, UsagerOptionsHistoryService],
})
export class UsagersModule {}