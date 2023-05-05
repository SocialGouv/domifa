import { Module } from "@nestjs/common";
import { ScheduleModule } from "@nestjs/schedule";
import { TerminusModule } from "@nestjs/terminus";

import { PortailAdminModule } from "./_portail-admin";
import { PortailUsagerModule } from "./_portail-usager";
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
import { AppLogsModule } from "./modules/app-logs/app-logs.module";
import { ContactSupportModule } from "./modules/contact-support/contact-support.module";

@Module({
  controllers: [HealthController],
  exports: [],
  imports: [
    AuthModule,
    ScheduleModule.forRoot(),
    TerminusModule,
    InteractionsModule,
    MonitoringModule,
    SmsModule,
    StatsModule,
    StructuresModule,
    UsagersModule,
    UsersModule,
    PortailUsagerModule,
    PortailAdminModule,
    AppLogsModule,
    ContactSupportModule,
  ],
  providers: [PostgresHealthIndicator],
})
export class AppModule {}
