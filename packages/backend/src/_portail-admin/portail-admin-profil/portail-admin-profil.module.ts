import { HttpModule } from "@nestjs/axios";
import { forwardRef, Module } from "@nestjs/common";
import { AuthModule } from "../../auth/auth.module";
import { PortailAdminProfileController } from "./portail-admin-profile.controller";

@Module({
  controllers: [PortailAdminProfileController],
  exports: [],
  imports: [HttpModule, forwardRef(() => AuthModule)],
  providers: [],
})
export class PortailAdminProfilModule {}
