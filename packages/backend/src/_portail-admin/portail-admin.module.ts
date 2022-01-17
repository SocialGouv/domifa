import { forwardRef, Module } from "@nestjs/common";

import { AuthModule } from "../auth/auth.module";
import { AdminStructuresDeleteModule } from "./admin-structures-delete";
import { AdminStructuresModule } from "./admin-structures/admin-structures.module";
import { PortailAdminLoginModule } from "./portail-admin-login";
import { PortailAdminProfilModule } from "./portail-admin-profil";
import { AdminSmsModule } from "./admin-sms";
import { LogsService } from "../logs/logs.service";

@Module({
  controllers: [],
  exports: [
    PortailAdminProfilModule,
    PortailAdminLoginModule,
    AdminStructuresDeleteModule,
    AdminStructuresModule,
    AdminSmsModule,
  ],
  imports: [
    forwardRef(() => AdminStructuresModule),
    PortailAdminProfilModule,
    PortailAdminLoginModule,
    AdminStructuresDeleteModule,
    AdminSmsModule,
    AuthModule,
  ],
  providers: [LogsService],
})
export class PortailAdminModule {}
