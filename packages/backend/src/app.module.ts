import { Module } from "@nestjs/common";
import { APP_INTERCEPTOR } from "@nestjs/core";
import { MongooseModule } from "@nestjs/mongoose";
import { ScheduleModule } from "@nestjs/schedule";
import { TerminusModule } from "@nestjs/terminus";
import * as mongoose from "mongoose";
import { RavenInterceptor, RavenModule } from "nest-raven";
import { AuthModule } from "./auth/auth.module";
import { domifaConfig } from "./config";
import { buildMongoConnectionStringFromEnv } from "./database";
import { MonitoringModule } from "./database/services/monitoring/monitoring.module";
import { HealthController } from "./health/health.controller";
import { PostgresHealthIndicator } from "./health/postgres-health-indicator.service";
import { InteractionsModule } from "./interactions/interactions.module";
import { StatsModule } from "./stats/stats.module";
import { StructuresModule } from "./structures/structure.module";
import { UsagersModule } from "./usagers/usagers.module";
import { UsersModule } from "./users/users.module";
import { appLogger } from "./util";

const mongoConnectionString = buildMongoConnectionStringFromEnv();

if (domifaConfig().mongo.debug) {
  appLogger.debug("[app.module] mongoConnectionString:", mongoConnectionString);
}

mongoose.set("debug", domifaConfig().mongo.debug);

@Module({
  controllers: [HealthController],
  exports: [],
  imports: [
    AuthModule,
    InteractionsModule,
    RavenModule,
    ScheduleModule.forRoot(),
    StatsModule,
    StructuresModule,
    MonitoringModule,
    UsagersModule,
    UsersModule,
    MongooseModule.forRoot(mongoConnectionString, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
      useCreateIndex: true,
    }),
    TerminusModule,
  ],
  providers: [
    PostgresHealthIndicator,
    {
      provide: APP_INTERCEPTOR,
      useValue: new RavenInterceptor({
        tags: { serverName: domifaConfig().envId },
      }),
    },
  ],
})
export class AppModule {}
