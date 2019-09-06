import { Module } from "@nestjs/common";
import { ConfigService } from "../config/config.service";
import { DatabaseModule } from "../database/database.module";
import { MailerService } from "../users/mailer.service";
import { UsersProviders } from "../users/users.providers";
import { UsersService } from "../users/users.service";
import { StructuresProviders } from "./structures-providers";
import { StructuresController } from "./structures.controller";
import { StructuresService } from "./structures.service";

@Module({
  controllers: [StructuresController],
  exports: [StructuresService],
  imports: [DatabaseModule],
  providers: [
    StructuresService,
    ...StructuresProviders,
    ...UsersProviders,
    ConfigService,
    UsersService,
    MailerService
  ]
})
export class StructuresModule {}
