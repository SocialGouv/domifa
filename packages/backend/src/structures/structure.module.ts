import { forwardRef, Module } from "@nestjs/common";
import { ConfigService } from "../config/config.service";
import { DatabaseModule } from "../database/database.module";
import { InteractionsModule } from "../interactions/interactions.module";
import { UsagersModule } from "../usagers/usagers.module";
import { UsersModule } from "../users/users.module";
import { StructuresProviders } from "./structures-providers";
import { StructuresController } from "./structures.controller";
import { StructuresService } from "./structures.service";

@Module({
  controllers: [StructuresController],
  exports: [StructuresService, ...StructuresProviders],
  imports: [
    DatabaseModule,
    forwardRef(() => UsersModule),
    forwardRef(() => UsagersModule),
    forwardRef(() => InteractionsModule)
  ],
  providers: [StructuresService, ...StructuresProviders, ConfigService]
})
export class StructuresModule {}
