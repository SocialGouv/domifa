import { forwardRef, HttpModule, Module } from "@nestjs/common";
import { InteractionsModule } from "../interactions/interactions.module";
import { MailsModule } from "../mails/mails.module";
import { StatsModule } from "../stats/stats.module";
import { StructuresModule } from "../structures/structure.module";
import { UsersModule } from "../users/users.module";
import { AgendaController } from "./controllers/agenda.controller";
import { DocsController } from "./controllers/docs.controller";
import { ExportStructureUsagersController } from "./controllers/export-structure-usagers.controller";
import { ImportController } from "./controllers/import/import.controller";
import { UsagerStructureDocsController } from "./controllers/usager-structure-docs.controller";
import { UsagersController } from "./controllers/usagers.controller";
import { CerfaService } from "./services/cerfa.service";
import { DocumentsService } from "./services/documents.service";
import { UsagersService } from "./services/usagers.service";

@Module({
  controllers: [
    UsagersController,
    ImportController,
    AgendaController,
    UsagerStructureDocsController,
    DocsController,
    ExportStructureUsagersController,
  ],
  exports: [UsagersService, CerfaService, DocumentsService],
  imports: [
    HttpModule,
    forwardRef(() => MailsModule),
    forwardRef(() => StructuresModule),
    forwardRef(() => StatsModule),
    forwardRef(() => UsersModule),
    forwardRef(() => InteractionsModule),
  ],
  providers: [UsagersService, CerfaService, DocumentsService],
})
export class UsagersModule {}
