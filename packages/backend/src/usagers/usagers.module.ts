import { forwardRef, HttpModule, Module } from "@nestjs/common";
import { DatabaseModule } from "../database/database.module";
import { InteractionsModule } from "../interactions/interactions.module";
import { InteractionsProviders } from "../interactions/interactions.providers";
import { MailsModule } from "../mails/mails.module";
import { StatsModule } from "../stats/stats.module";
import { StructuresModule } from "../structures/structure.module";
import { UsersModule } from "../users/users.module";
import { AgendaController } from "./controllers/agenda.controller";
import { DocsController } from "./controllers/docs.controller";
import { ExportStructureUsagersController } from "./controllers/export-structure-usagers.controller";
import { ImportController } from "./controllers/import.controller";
import { SearchController } from "./controllers/search.controller";
import { UsagersController } from "./controllers/usagers.controller";
import { CerfaService } from "./services/cerfa.service";
import { DocumentsService } from "./services/documents.service";
import { UsagersService } from "./services/usagers.service";
import { UsagersProviders } from "./usagers.providers";


@Module({
  controllers: [
    UsagersController,
    ImportController,
    SearchController,
    AgendaController,
    DocsController,
    ExportStructureUsagersController,
  ],
  exports: [
    UsagersService,
    CerfaService,
    DocumentsService,

    ...UsagersProviders,
    ...InteractionsProviders,
  ],
  imports: [
    HttpModule,
    DatabaseModule,
    forwardRef(() => MailsModule),
    forwardRef(() => StructuresModule),
    forwardRef(() => StatsModule),
    forwardRef(() => UsersModule),
    forwardRef(() => InteractionsModule),
  ],
  providers: [
    UsagersService,
    CerfaService,
    DocumentsService,
    ...UsagersProviders,
    ...InteractionsProviders,
  ],
})
export class UsagersModule {}
