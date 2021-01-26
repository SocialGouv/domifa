import { forwardRef, HttpModule, Module } from "@nestjs/common";
import { DatabaseModule } from "../database";
import { InteractionsModule } from "../interactions/interactions.module";
import { MailsModule } from "../mails/mails.module";
import { StatsModule } from "../stats/stats.module";
import { UsagersModule } from "../usagers/usagers.module";
import { UsersModule } from "../users/users.module";
import { StructureDocController } from "./controllers/structure-doc.controller";
import { StructuresController } from "./controllers/structures.controller";
import { StructureDocService } from "./services/structure-doc.service";
import { StructureCreatorService } from "./services/structureCreator.service";
import { StructureDeletorService } from "./services/structureDeletor.service";
import { StructureHardResetService } from "./services/structureHardReset.service";
import { StructuresService } from "./services/structures.service";
import { StructuresProviders } from "./structures-providers";

@Module({
  controllers: [StructuresController, StructureDocController],
  exports: [
    StructuresService,
    StructureCreatorService,
    StructureDeletorService,
    StructureHardResetService,
    StructureDocService,
    ...StructuresProviders,
  ],
  imports: [
    DatabaseModule,
    HttpModule,
    forwardRef(() => MailsModule),
    forwardRef(() => UsersModule),
    forwardRef(() => UsagersModule),
    forwardRef(() => StatsModule),
    forwardRef(() => InteractionsModule),
  ],
  providers: [
    StructuresService,
    StructureCreatorService,
    StructureDeletorService,
    StructureHardResetService,
    StructureDocService,
    ...StructuresProviders,
  ],
})
export class StructuresModule {}
