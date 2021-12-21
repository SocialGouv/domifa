import { HttpModule } from "@nestjs/axios";
import { forwardRef, Module } from "@nestjs/common";

import { InteractionsModule } from "../interactions/interactions.module";
import { MailsModule } from "../mails/mails.module";
import { StatsModule } from "../stats/stats.module";
import { UsagersModule } from "../usagers/usagers.module";
import { UsersModule } from "../users/users.module";
import { StructureDocController } from "./controllers/structure-doc.controller";
import { StructuresController } from "./controllers/structures.controller";
import { StructuresPublicController } from "./controllers/structures.public.controller";
import { StructureDocService } from "./services/structure-doc.service";
import { StructureHardResetService } from "./services/structureHardReset.service";
import { StructuresService } from "./services/structures.service";

@Module({
  controllers: [
    StructuresController,
    StructuresPublicController,
    StructureDocController,
  ],
  exports: [StructuresService, StructureHardResetService, StructureDocService],
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
    StructureDocService,
  ],
})
export class StructuresModule {}
