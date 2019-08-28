import { forwardRef, Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { AuthService } from "../auth/auth.service";
import { ConfigService } from "../config/config.service";
import { DatabaseModule } from "../database/database.module";
import { StructuresModule } from "../structures/structure.module";
import { StructuresProviders } from "../structures/structures-providers";
import { StructuresService } from "../structures/structures.service";
import { MailerService } from "./mailer.service";
import { UserSchema } from "./user.schema";
import { UsersController } from "./users.controller";
import { UsersProviders } from "./users.providers";
import { UsersService } from "./users.service";

@Module({
  controllers: [UsersController],
  exports: [UsersService, MailerService],
  imports: [DatabaseModule, forwardRef(() => AuthModule), StructuresModule],
  providers: [UsersService, ...UsersProviders, MailerService, ConfigService]
})
export class UsersModule {}
