import { HttpModule } from "@nestjs/axios";
import { forwardRef, Module } from "@nestjs/common";

import { InteractionsModule } from "../modules/interactions/interactions.module";
import { StatsModule } from "../modules/stats/stats.module";
import { StructuresModule } from "../modules/structures/structure.module";
import { UsersModule } from "../modules/users/users.module";
import { AgendaController } from "./controllers/agenda.controller";
import { UsagerDocsController } from "./controllers/usager-docs.controller";
import { ExportStructureUsagersController } from "./controllers/export-structure-usagers.controller";
import { ImportController } from "./controllers/import/import.controller";
import { UsagerNotesController } from "./controllers/usager-notes.controller";
import { UsagerStructureDocsController } from "./controllers/usager-structure-docs.controller";
import { UsagersDecisionController } from "./controllers/usagers-decision.controller";
import { UsagersController } from "./controllers/usagers.controller";
import { UsagerOptionsController } from "./controllers/usager-options.controller";

import { UsagersService } from "./services/usagers.service";
import { UsagerOptionsHistoryService } from "./services/usagerOptionsHistory.service";
import { AppLogsModule } from "../modules/app-logs/app-logs.module";
import { OtpModule } from "../modules/otp/otp.module";
import { SecurityMonitoringModule } from "../modules/security-monitoring/security-monitoring.module";
import { UsagerHistoryStateService } from "./services/usagerHistoryState.service";
import { ImportCreatorService } from "./controllers/import/step3-create";
import { FileManagerService } from "../util/file-manager/file-manager.service";
import { AppLogsService } from "../modules/app-logs/app-logs.service";
import { MailsModule } from "../modules/mails/mails.module";
import { SearchUsagersController } from "./controllers/search-usagers.controller";
import { UsagersLienController } from "./controllers/usagers-lien.controller";
import { UsagersLogsService } from "./services/usagers-logs.service";
import { UsagerLienService } from "./services/usagerLien.service";
import { UsagerLienLogsService } from "./services/usagerLienLogs.service";
import { AppointmentInvitationService } from "./services";

@Module({
  controllers: [
    UsagersController,
    ImportController,
    AgendaController,
    UsagerNotesController,
    UsagersDecisionController,
    UsagerStructureDocsController,
    UsagerDocsController,
    ExportStructureUsagersController,
    UsagerOptionsController,
    SearchUsagersController,
    UsagersLienController,
  ],
  exports: [
    UsagersService,
    UsagerHistoryStateService,
    ImportCreatorService,
    AppointmentInvitationService,
  ],
  imports: [
    HttpModule,
    forwardRef(() => MailsModule),
    forwardRef(() => StructuresModule),
    forwardRef(() => StatsModule),
    forwardRef(() => UsersModule),
    forwardRef(() => InteractionsModule),
    forwardRef(() => AppLogsModule),
    forwardRef(() => OtpModule),
    SecurityMonitoringModule,
  ],
  providers: [
    UsagersService,
    UsagerOptionsHistoryService,
    UsagerHistoryStateService,
    ImportCreatorService,
    FileManagerService,
    AppLogsService,
    AppointmentInvitationService,
    UsagersLogsService,
    UsagerLienService,
    UsagerLienLogsService,
  ],
})
export class UsagersModule {}
