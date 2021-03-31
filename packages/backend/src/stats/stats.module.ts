import { forwardRef, Module } from "@nestjs/common";
import { InteractionsModule } from "../interactions/interactions.module";
import { StructuresModule } from "../structures/structure.module";
import { UsagersModule } from "../usagers/usagers.module";
import { UsersModule } from "../users/users.module";
import { DashboardController } from "./controllers/dashboard.controller";
import { StatsController } from "./controllers/stats.controller";
import { DashboardService } from "./services/dashboard.service";
import { StatsGeneratorService } from "./services/stats-generator.service";
import { StatsService } from "./services/stats.service";

@Module({
  controllers: [StatsController, DashboardController],
  exports: [StatsService, StatsGeneratorService, DashboardService],
  imports: [
    forwardRef(() => UsersModule),
    forwardRef(() => StructuresModule),
    forwardRef(() => UsagersModule),
    forwardRef(() => InteractionsModule),
  ],
  providers: [StatsService, StatsGeneratorService, DashboardService],
})
export class StatsModule {}
