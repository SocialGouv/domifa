import { forwardRef, Module } from "@nestjs/common";
import { InteractionsModule } from "../interactions/interactions.module";
import { StructuresModule } from "../structures/structure.module";
import { UsagersModule } from "../usagers/usagers.module";
import { UsersModule } from "../users/users.module";
import { AdminStructuresModule } from "../_portail-admin/admin-structures/admin-structures.module";
import { StatsPrivateController } from "./controllers/stats.private.controller";
import { StatsPublicController } from "./controllers/stats.public.controller";

@Module({
  controllers: [StatsPublicController, StatsPrivateController],
  exports: [],
  imports: [
    forwardRef(() => AdminStructuresModule),
    forwardRef(() => UsersModule),
    forwardRef(() => StructuresModule),
    forwardRef(() => UsagersModule),
    forwardRef(() => InteractionsModule),
  ],
  providers: [],
})
export class StatsModule {}
