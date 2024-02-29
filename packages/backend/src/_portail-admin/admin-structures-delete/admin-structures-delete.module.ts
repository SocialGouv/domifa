import { forwardRef, Module } from "@nestjs/common";
import { InteractionsModule } from "../../interactions/interactions.module";
import { StructuresModule } from "../../structures/structure.module";
import { UsagersModule } from "../../usagers/usagers.module";
import { UsersModule } from "../../users/users.module";
import { AdminStructuresDeleteController } from "./controllers/admin-structures-delete.controller";
import { FileManagerService } from "../../util/file-manager/file-manager.service";

@Module({
  controllers: [AdminStructuresDeleteController],
  exports: [],
  imports: [
    forwardRef(() => UsersModule),
    forwardRef(() => StructuresModule),
    forwardRef(() => UsagersModule),
    forwardRef(() => InteractionsModule),
  ],
  providers: [FileManagerService],
})
export class AdminStructuresDeleteModule {}
