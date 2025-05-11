import { Module } from "@nestjs/common";
import { ScheduleModule } from "@nestjs/schedule";

import { PortailAdminModule } from "./modules/portail-admin";
import { PortailUsagersModule } from "./modules/portail-usagers";
import { AuthModule } from "./auth/auth.module";
import { MonitoringModule } from "./database/services/monitoring/monitoring.module";
import { InteractionsModule } from "./modules/interactions/interactions.module";
import { StructuresModule } from "./modules/structures/structure.module";
import { UsagersModule } from "./usagers/usagers.module";
import { AppLogsModule } from "./modules/app-logs/app-logs.module";
import { ContactSupportModule } from "./modules/contact-support/contact-support.module";
import { FileManagerService } from "./util/file-manager/file-manager.service";
import { InteractionsService } from "./modules/interactions/services";
import { SmsModule } from "./modules/sms/sms.module";
import { OpenDataPlacesModule } from "./modules/open-data/open-data-places.module";
import { UsersModule } from "./modules/users/users.module";
import { HealthModule } from "./modules/health/health.module";
import { StatsModule } from "./modules/stats/stats.module";

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
