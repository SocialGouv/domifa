import { ModuleMetadata } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { StatsModule } from "../stats/stats.module";
import { StructuresModule } from "../structures/structure.module";
import { UsersModule } from "../users/users.module";
import { PortailAdminModule } from "../modules/portail-admin";
import { PortailUsagersModule } from "../modules/portail-usagers";

export const SECURITY_TESTS_NEST_MODULE: ModuleMetadata = {
  controllers: [],
  imports: [
    AuthModule,
    UsersModule,
    StructuresModule,
    StatsModule,
    PortailUsagersModule,
    PortailAdminModule,
  ],
  providers: [],
};
