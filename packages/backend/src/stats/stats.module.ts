import { forwardRef, Module } from "@nestjs/common";
import { ConfigService } from "../config/config.service";
import { DatabaseModule } from "../database/database.module";
import { InteractionsModule } from "../interactions/interactions.module";
import { StructuresModule } from "../structures/structure.module";
import { UsagersModule } from "../usagers/usagers.module";
import { UsersModule } from "../users/users.module";
import { StatsProviders } from "./stats-providers";
import { StatsController } from "./stats.controller";
import { StatsService } from "./stats.service";

@Module({
  controllers: [StatsController],
  exports: [StatsService, ...StatsProviders],
  imports: [
    DatabaseModule,

    forwardRef(() => UsersModule),
    forwardRef(() => StructuresModule),
    forwardRef(() => UsagersModule),
    forwardRef(() => InteractionsModule),
  ],
  providers: [StatsService, ...StatsProviders, ConfigService],
})
export class StatsModule {}
