import { Module } from "@nestjs/common";
import { DatabaseModule } from "../database/database.module";
import { UsersModule } from "../users/users.module";
import { CerfaService } from "./services/cerfa.service";
import { DocumentsService } from "./services/documents.service";
import { UsagersService } from "./services/usagers.service";
import { UsagersController } from "./usagers.controller";
import { UsagersProviders } from "./usagers.providers";

@Module({
  controllers: [UsagersController],
  exports: [UsagersService, CerfaService, DocumentsService],
  imports: [DatabaseModule, UsersModule],
  providers: [
    UsagersService,
    CerfaService,
    DocumentsService,
    ...UsagersProviders
  ]
})
export class UsagersModule {}
