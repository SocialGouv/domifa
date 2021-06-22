import { Module } from "@nestjs/common";
import { ScheduleModule } from "@nestjs/schedule";
import { TerminusModule } from "@nestjs/terminus";
import { AuthModule } from "./auth/auth.module";
import { MonitoringModule } from "./database/services/monitoring/monitoring.module";
import { HealthController } from "./health/health.controller";
import { PostgresHealthIndicator } from "./health/postgres-health-indicator.service";
import { InteractionsModule } from "./interactions/interactions.module";
import { SmsModule } from "./sms/sms.module";
import { StatsModule } from "./stats/stats.module";
import { StructuresModule } from "./structures/structure.module";
import { UsagersModule } from "./usagers/usagers.module";
import { UsersModule } from "./users/users.module";
@Module({
  controllers: [HealthController],
  exports: [],
  imports: [
    AuthModule,
    InteractionsModule,
    SmsModule,
    ScheduleModule.forRoot(),
    StatsModule,
    StructuresModule,
    MonitoringModule,
    UsagersModule,
    UsersModule,
    TerminusModule,
  ],
  providers: [PostgresHealthIndicator],
})
export class AppModule {}
