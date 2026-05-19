import { Module, Logger } from "@nestjs/common";
import { SentryModule } from "@sentry/nestjs/setup";
import { ScheduleModule } from "@nestjs/schedule";
import { ThrottlerModule } from "@nestjs/throttler";
import { AppThrottlerGuard } from "./auth/guards/app-throttler";
import { domifaConfig } from "./config";

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
import { OtpModule } from "./modules/otp/otp.module";
import { SecurityMonitoringModule } from "./modules/security-monitoring/security-monitoring.module";
import { UsersModule } from "./modules/users/users.module";
import { HealthModule } from "./modules/health/health.module";
import { StatsModule } from "./modules/stats/stats.module";
import { APP_GUARD, APP_INTERCEPTOR } from "@nestjs/core";
import { AppSentryInterceptor } from "./util";

const appModuleLogger = new Logger("AppModule");

const SKIP_THROTTLE_ENVS = ["test"];
const envId = domifaConfig().envId;
const isThrottled = !SKIP_THROTTLE_ENVS.includes(envId);

appModuleLogger.log(
  `[THROTTLE CONFIG] envId="${envId}" isThrottled=${isThrottled} (SKIP_THROTTLE_ENVS=${JSON.stringify(
    SKIP_THROTTLE_ENVS
  )})`
);

const throttlerImports = isThrottled
  ? [
      ThrottlerModule.forRoot([
        { name: "short", ttl: 1_000, limit: 13, blockDuration: 1_800_000 }, // 13 req/s, block 30min
        { name: "medium", ttl: 60_000, limit: 125, blockDuration: 3_600_000 }, // 125 req/min, block 1h
        {
          name: "long",
          ttl: 3_600_000,
          limit: 7_500,
          blockDuration: 7_200_000,
        }, // 7500 req/h, block 2h
      ]),
    ]
  : [];

const throttlerProviders = isThrottled
  ? [
      {
        provide: APP_GUARD,
        useClass: AppThrottlerGuard,
      },
    ]
  : [];

appModuleLogger.log(
  `[THROTTLE CONFIG] ThrottlerModule ${
    isThrottled ? "ENABLED" : "DISABLED"
  } | Guard ${isThrottled ? "REGISTERED" : "NOT REGISTERED"}`
);

@Module({
  exports: [FileManagerService],
  imports: [
    SentryModule.forRoot(),
    ...throttlerImports,
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
    OtpModule,
    SecurityMonitoringModule,
  ],
  providers: [
    FileManagerService,
    InteractionsService,
    ...throttlerProviders,
    {
      provide: APP_INTERCEPTOR,
      useClass: AppSentryInterceptor,
    },
  ],
})
export class AppModule {}
