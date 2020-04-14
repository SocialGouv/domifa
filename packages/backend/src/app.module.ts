import { APP_INTERCEPTOR } from "@nestjs/core";
import { AuthModule } from "./auth/auth.module";
import { ConfigService } from "./config/config.service";
import { HealthController } from "./health.controller";
import { HealthModule } from "./health/health.module";
import { InteractionsModule } from "./interactions/interactions.module";
import { MailJetService } from "./users/services/mailjet.service";
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { RavenInterceptor, RavenModule } from "nest-raven";
import { ScheduleModule } from "@nestjs/schedule";
import { StatsModule } from "./stats/stats.module";
import { StructuresModule } from "./structures/structure.module";
import { TerminusModule } from "@nestjs/terminus";

import { UsagersModule } from "./usagers/usagers.module";
import { UsersModule } from "./users/users.module";
import * as mongoose from "mongoose";

const config = new ConfigService();
const user = config.get("DB_USER");
const password = config.get("DB_PASS");
const host = config.get("DB_HOST");
const port = config.get("DB_PORT");

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
    MongooseModule.forRoot(
      "mongodb://" +
        user +
        ":" +
        password +
        "@" +
        host +
        ":" +
        port +
        "/domifa",
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
        useCreateIndex: true,
      }
    ),
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
