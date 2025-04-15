import { Module } from "@nestjs/common";

import { AuthModule } from "../../auth/auth.module";

import { AppLogsService } from "../app-logs/app-logs.service";
import { AdminStructuresController } from "./controllers/admin-structures/admin-structures.controller";
import { AdminStructuresDeleteController } from "./controllers/admin-structures-delete/admin-structures-delete.controller";
import { PortailAdminLoginController } from "./controllers/portail-admin-login/portail-admin-login.controller";
import { PortailAdminProfileController } from "./controllers/portail-admin-profile.controller";
import { AdminStructuresService } from "./services";
import { FileManagerService } from "../../util/file-manager/file-manager.service";
import { NationalStatsController } from "./controllers/national-stats/national-stats.controller";

@Module({
  controllers: [
    AdminStructuresController,
    AdminStructuresDeleteController,
    PortailAdminLoginController,
    PortailAdminProfileController,
    NationalStatsController,
  ],
  imports: [AuthModule],
  providers: [AppLogsService, AdminStructuresService, FileManagerService],
})
export class PortailAdminModule {}
