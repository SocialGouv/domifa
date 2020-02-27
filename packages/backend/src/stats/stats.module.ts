import { Module, forwardRef } from "@nestjs/common";
import { StatsController } from "./stats.controller";
import { StatsService } from "./stats.service";
import { StructuresModule } from "../structures/structure.module";
import { StatsProviders } from "./stats-providers";
import { DatabaseModule } from "../database/database.module";
import { UsersModule } from "../users/users.module";
import { UsagersModule } from "../usagers/usagers.module";
import { ConfigService } from "../config/config.service";
import { InteractionsModule } from "../interactions/interactions.module";

@Module({
  controllers: [StatsController],
  exports: [StatsService],
  imports: [
    DatabaseModule,
    forwardRef(() => UsersModule),
    forwardRef(() => StructuresModule),
    forwardRef(() => UsagersModule),
    forwardRef(() => InteractionsModule)
  ],
  providers: [StatsService, ...StatsProviders, ConfigService]
})
export class StatsModule {}
