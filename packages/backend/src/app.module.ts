import { Module } from "@nestjs/common";
import { APP_INTERCEPTOR } from "@nestjs/core";
import { RavenInterceptor, RavenModule } from "nest-raven";
import { AuthModule } from "./auth/auth.module";
import { ConfigService } from "./config/config.service";
import { DatabaseModule } from "./database/database.module";
import { InteractionsModule } from "./interactions/interactions.module";
import { StatsModule } from "./stats/stats.module";
import { StructuresModule } from "./structures/structure.module";
import * as mongoose from "mongoose";

import { ScheduleModule } from "@nestjs/schedule";
import { HealthModule } from "./health/health.module";
import { UsagersModule } from "./usagers/usagers.module";
import { MailerService } from "./users/services/mailer.service";
import { UsersModule } from "./users/users.module";
import { MongooseModule } from "@nestjs/mongoose";
import { TerminusModule } from "@nestjs/terminus";
import { HealthController } from "./health.controller";

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
    UsagersModule,
    UsersModule,
    AuthModule,
    StructuresModule,
    InteractionsModule,
    RavenModule,
    StatsModule,
    HealthModule,
    ScheduleModule.forRoot(),
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
      useValue: new RavenInterceptor(),
    },
    {
      provide: ConfigService,
      useValue: new ConfigService(),
    },
    MailerService,
  ],
})
export class AppModule {}
