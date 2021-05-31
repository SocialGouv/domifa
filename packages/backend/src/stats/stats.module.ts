import { forwardRef, Module } from "@nestjs/common";
import { InteractionsModule } from "../interactions/interactions.module";
import { StructuresModule } from "../structures/structure.module";
import { UsagersModule } from "../usagers/usagers.module";
import { UsersModule } from "../users/users.module";
import { DashboardController } from "./controllers/dashboard.controller";
import { StatsController } from "./controllers/stats.controller";
import { DashboardService } from "./services/dashboard.service";

@Module({
  controllers: [StatsController, DashboardController],
  exports: [DashboardService],
  imports: [
    forwardRef(() => UsersModule),
    forwardRef(() => StructuresModule),
    forwardRef(() => UsagersModule),
    forwardRef(() => InteractionsModule),
  ],
  providers: [DashboardService],
})
export class StatsModule {}
