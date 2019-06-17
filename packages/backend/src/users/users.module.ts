import { Module } from "@nestjs/common";
import { DatabaseModule } from "../database/database.module";
import { StructuresModule } from "../structures/structure.module";
import { UserSchema } from "./user.schema";
import { UsersController } from "./users.controller";
import { UsersProviders } from "./users.providers";
import { UsersService } from "./users.service";

@Module({
  controllers: [UsersController],
  exports: [UsersService],
  imports: [DatabaseModule, StructuresModule],
  providers: [UsersService, ...UsersProviders]
})
export class UsersModule {}
