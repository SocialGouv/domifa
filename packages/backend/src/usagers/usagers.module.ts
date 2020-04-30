import { forwardRef, Module } from "@nestjs/common";
import { DatabaseModule } from "../database/database.module";
import { InteractionsModule } from "../interactions/interactions.module";
import { InteractionsProviders } from "../interactions/interactions.providers";
import { StructuresModule } from "../structures/structure.module";
import { UsersModule } from "../users/users.module";
import { ImportController } from "./controllers/import.controller";
import { UsagersController } from "./controllers/usagers.controller";
import { CerfaService } from "./services/cerfa.service";
import { DocumentsService } from "./services/documents.service";
import { UsagersService } from "./services/usagers.service";
import { UsagersProviders } from "./usagers.providers";
import { SearchController } from "./controllers/search.controller";
import { StatsModule } from "../stats/stats.module";
import { DocsController } from "./controllers/docs.controller";
import { ExportController } from "./controllers/export.controller";

@Module({
  controllers: [
    UsagersController,
    ImportController,
    SearchController,
    DocsController,
    ExportController,
  ],
  exports: [
    UsagersService,
    CerfaService,
    DocumentsService,
    ...UsagersProviders,
    ...InteractionsProviders,
  ],
  imports: [
    DatabaseModule,
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
