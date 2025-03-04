import { Module } from "@nestjs/common";
import { ScheduleModule } from "@nestjs/schedule";

import { PortailAdminModule } from "./modules/portail-admin";
import { PortailUsagersModule } from "./modules/portail-usagers";
import { AuthModule } from "./auth/auth.module";
import { MonitoringModule } from "./database/services/monitoring/monitoring.module";
import { InteractionsModule } from "./modules/interactions/interactions.module";
import { StatsModule } from "./stats/stats.module";
import { StructuresModule } from "./structures/structure.module";
import { UsagersModule } from "./usagers/usagers.module";
import { AppLogsModule } from "./modules/app-logs/app-logs.module";
import { ContactSupportModule } from "./modules/contact-support/contact-support.module";
import { FileManagerService } from "./util/file-manager/file-manager.service";
import { InteractionsService } from "./modules/interactions/services";
import { SmsModule } from "./modules/sms/sms.module";
import { OpenDataPlacesModule } from "./modules/open-data-places/open-data-places.module";
import { UsersModule } from "./users/users.module";
import { HealthModule } from "./modules/health/health.module";

@Module({
  exports: [FileManagerService],
  imports: [
    AuthModule,
    ScheduleModule.forRoot(),
    HealthModule,
    InteractionsModule,
    MonitoringModule,
    SmsModule,
    StatsModule,
    StructuresModule,
    UsagersModule,
    UsersModule,
    PortailUsagersModule,
    PortailAdminModule,
    AppLogsModule,
    ContactSupportModule,
    OpenDataPlacesModule,
  ],
  providers: [FileManagerService, InteractionsService],
})
export class AppModule {}
