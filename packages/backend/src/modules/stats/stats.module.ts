import { CacheModule } from "@nestjs/cache-manager";
import { forwardRef, Module } from "@nestjs/common";
import { UsagersModule } from "../../usagers/usagers.module";
import { AppLogsService } from "../app-logs/app-logs.service";
import { InteractionsModule } from "../interactions/interactions.module";
import { StructuresModule } from "../structures/structure.module";
import { UsersModule } from "../users/users.module";
import { StatsPrivateController } from "./controllers/stats.private.controller";
import { StatsPublicController } from "./controllers/stats.public.controller";
import { PublicStatsService } from "./services";

@Module({
  controllers: [StatsPublicController, StatsPrivateController],
  exports: [],
  imports: [
    CacheModule.register({ ttl: 86400 }),
    forwardRef(() => UsersModule),
    forwardRef(() => StructuresModule),
    forwardRef(() => UsagersModule),
    forwardRef(() => InteractionsModule),
  ],
  providers: [PublicStatsService, AppLogsService],
})
export class StatsModule {}
