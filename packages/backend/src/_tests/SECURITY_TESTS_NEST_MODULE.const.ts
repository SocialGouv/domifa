import { ModuleMetadata } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { StatsModule } from "../stats/stats.module";
import { StructuresModule } from "../structures/structure.module";
import { UsersModule } from "../users/users.module";
import { PortailAdminModule } from "../_portail-admin";
import { PortailUsagerModule } from "../_portail-usager";

export const SECURITY_TESTS_NEST_MODULE: ModuleMetadata = {
  controllers: [],
  imports: [
    AuthModule,
    UsersModule,
    StructuresModule,
    StatsModule,
    PortailUsagerModule,
    PortailAdminModule,
  ],
  providers: [],
};
