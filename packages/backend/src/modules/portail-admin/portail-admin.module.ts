import { Module } from "@nestjs/common";

import { AuthModule } from "../../auth/auth.module";

import { AppLogsService } from "../app-logs/app-logs.service";
import { AdminStructuresController } from "./controllers/admin-structures/admin-structures.controller";
import { PortailAdminLoginController } from "./controllers/portail-admin-login/portail-admin-login.controller";
import { AdminStructuresService } from "./services";
import { FileManagerService } from "../../util/file-manager/file-manager.service";
import { NationalStatsController } from "./controllers/national-stats/national-stats.controller";
import { AdminUsersController } from "./controllers/admin-users/admin-users.controller";
import { AdminSuperivorUsersService } from "./services/admin-superivor-users/admin-superivor-users.service";

@Module({
  controllers: [
    AdminStructuresController,
    PortailAdminLoginController,
    NationalStatsController,
    AdminUsersController,
  ],
  imports: [AuthModule],
  providers: [
    AppLogsService,
    AdminStructuresService,
    FileManagerService,
    AdminSuperivorUsersService,
  ],
})
export class PortailAdminModule {}
