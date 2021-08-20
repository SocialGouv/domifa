import { forwardRef, Module } from "@nestjs/common";
import { HttpModule } from "@nestjs/axios";

import { InteractionsModule } from "../interactions/interactions.module";
import { MailsModule } from "../mails/mails.module";
import { StatsModule } from "../stats/stats.module";
import { UsagersModule } from "../usagers/usagers.module";
import { UsersModule } from "../users/users.module";
import { StructureDocController } from "./controllers/structure-doc.controller";
import { StructuresController } from "./controllers/structures.controller";
import { StructureDocService } from "./services/structure-doc.service";
import { StructureCreatorService } from "./services/structureCreator.service";
import { StructureHardResetService } from "./services/structureHardReset.service";
import { StructuresService } from "./services/structures.service";

@Module({
  controllers: [StructuresController, StructureDocController],
  exports: [
    StructuresService,
    StructureCreatorService,
    StructureHardResetService,
    StructureDocService,
  ],
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
    StructureCreatorService,
    StructureHardResetService,
    StructureDocService,
  ],
})
export class StructuresModule {}
