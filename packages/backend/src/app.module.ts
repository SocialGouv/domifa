import { Module } from "@nestjs/common";
import { APP_INTERCEPTOR } from "@nestjs/core";
import { MongooseModule } from "@nestjs/mongoose";
import { ScheduleModule } from "@nestjs/schedule";
import { TerminusModule } from "@nestjs/terminus";
import * as mongoose from "mongoose";
import { RavenInterceptor, RavenModule } from "nest-raven";
import { AuthModule } from "./auth/auth.module";
import { ConfigService } from "./config/config.service";
import { buildMongoConnectionStringFromEnv } from "./database/database.providers";
import { HealthController } from "./health.controller";
import { HealthModule } from "./health/health.module";
import { InteractionsModule } from "./interactions/interactions.module";
import { StatsModule } from "./stats/stats.module";
import { StructuresModule } from "./structures/structure.module";
import { UsagersModule } from "./usagers/usagers.module";
import { MailJetService } from "./users/services/mailjet.service";
import { UsersModule } from "./users/users.module";

const config = new ConfigService();

const mongoConnectionString = buildMongoConnectionStringFromEnv();

mongoose.set("debug", config.get("IS_LOCAL") !== undefined);

@Module({
  controllers: [HealthController],
  exports: [ConfigService],
  imports: [
    AuthModule,
    HealthModule,
    InteractionsModule,
    RavenModule,
    ScheduleModule.forRoot(),
    StatsModule,
    StructuresModule,
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
    {
      provide: APP_INTERCEPTOR,
      useValue: new RavenInterceptor({
        tags: { serverName: config.get("DOMAIN") },
      }),
    },
    {
      provide: ConfigService,
      useValue: new ConfigService(),
    },
    MailJetService,
  ],
})
export class AppModule {}
