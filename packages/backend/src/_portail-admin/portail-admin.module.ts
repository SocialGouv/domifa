import { forwardRef, Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { AdminStructuresDeleteModule } from "./admin-structures-delete";
import { AdminStructuresModule } from "./admin-structures/admin-structures.module";
import { PortailAdminLoginModule } from "./portail-admin-login";
import { PortailAdminProfilModule } from "./portail-admin-profil";

@Module({
  controllers: [],
  exports: [
    PortailAdminProfilModule,
    PortailAdminLoginModule,
    AdminStructuresDeleteModule,
    AdminStructuresModule,
  ],
  imports: [
    forwardRef(() => AdminStructuresModule),
    PortailAdminProfilModule,
    PortailAdminLoginModule,
    AdminStructuresDeleteModule,
    AuthModule,
  ],
  providers: [],
})
export class PortailAdminModule {}
