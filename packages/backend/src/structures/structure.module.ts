import { forwardRef, Module } from "@nestjs/common";
import { ConfigService } from "../config/config.service";
import { DatabaseModule } from "../database/database.module";
import { UsersModule } from "../users/users.module";
import { StructuresProviders } from "./structures-providers";
import { StructuresController } from "./structures.controller";
import { StructuresService } from "./structures.service";

@Module({
  controllers: [StructuresController],
  exports: [StructuresService],
  imports: [DatabaseModule, forwardRef(() => UsersModule)],
  providers: [StructuresService, ...StructuresProviders, ConfigService]
})
export class StructuresModule {}
