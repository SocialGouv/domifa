import { forwardRef, Module } from "@nestjs/common";
import { InteractionsModule } from "../interactions/interactions.module";
import { StructuresModule } from "../structures/structure.module";
import { UsagersModule } from "../usagers/usagers.module";
import { UsersModule } from "../users/users.module";
import { AdminStructuresModule } from "../_portail-admin/admin-structures/admin-structures.module";
import { StatsPrivateController } from "./controllers/stats.private.controller";
import { StatsPublicController } from "./controllers/stats.public.controller";
import { CacheInterceptor, CacheModule } from "@nestjs/cache-manager";
import { PublicStatsService } from "./services/publicStats.service";
import { APP_INTERCEPTOR } from "@nestjs/core";

@Module({
  controllers: [StatsPublicController, StatsPrivateController],
  exports: [],
  imports: [
    CacheModule.register({ ttl: 86400 }),
    forwardRef(() => AdminStructuresModule),
    forwardRef(() => UsersModule),
    forwardRef(() => StructuresModule),
    forwardRef(() => UsagersModule),
    forwardRef(() => InteractionsModule),
  ],
  providers: [
    PublicStatsService,
    {
      provide: APP_INTERCEPTOR,
      useClass: CacheInterceptor,
    },
  ],
})
export class StatsModule {}
