import { Module } from "@nestjs/common";
import { ScheduleModule } from "@nestjs/schedule";
import { TerminusModule } from "@nestjs/terminus";
import { SentryModule } from "@ntegral/nestjs-sentry";

import { PortailAdminModule } from "./_portail-admin";
import { PortailUsagerModule } from "./_portail-usager";
import { AuthModule } from "./auth/auth.module";
import { domifaConfig } from "./config";
import { MonitoringModule } from "./database/services/monitoring/monitoring.module";
import { HealthController } from "./health/health.controller";
import { PostgresHealthIndicator } from "./health/postgres-health-indicator.service";
import { InteractionsModule } from "./interactions/interactions.module";
import { SmsModule } from "./sms/sms.module";
import { StatsModule } from "./stats/stats.module";
import { StructuresModule } from "./structures/structure.module";
import { UsagersModule } from "./usagers/usagers.module";
import { UsersModule } from "./users/users.module";
import { LogsModule } from "./logs/logs.module";

@Module({
  controllers: [HealthController],
  exports: [],
  imports: [
    SentryModule.forRoot({
      debug: domifaConfig().dev.sentry.debugModeEnabled,
      dsn: domifaConfig().dev.sentry.sentryDsn,
      environment: domifaConfig().envId,
      logLevel: domifaConfig().dev.sentry.debugModeEnabled
        ? 3 // Verbose,
        : undefined,
      release: "domifa@" + domifaConfig().version, // default
    }),
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
    PortailUsagerModule,
    PortailAdminModule,
    LogsModule,
  ],
  providers: [PostgresHealthIndicator],
})
export class AppModule {}
