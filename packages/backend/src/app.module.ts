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
import { AppLogsModule } from "./modules/app-logs/app-logs.module";
import { ContactSupportModule } from "./modules/contact-support/contact-support.module";

@Module({
  controllers: [HealthController],
  exports: [],
  imports: [
    SentryModule.forRoot({
      debug: domifaConfig().dev.sentry.debugModeEnabled,
      dsn: domifaConfig().dev.sentry.sentryDsn,
      environment: domifaConfig().envId,
      logLevels: domifaConfig().dev.sentry.debugModeEnabled
        ? ["log", "error", "warn", "debug", "verbose"] // Verbose,
        : ["log", "error", "warn", "debug"],
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
    AppLogsModule,
    ContactSupportModule,
  ],
  providers: [PostgresHealthIndicator],
})
export class AppModule {}
