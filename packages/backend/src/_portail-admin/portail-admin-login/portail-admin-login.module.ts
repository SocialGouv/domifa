import { Module } from "@nestjs/common";
import { AuthModule } from "../../auth/auth.module";
import { PortailAdminLoginController } from "./portail-admin-login.controller";

@Module({
  controllers: [PortailAdminLoginController],
  exports: [AuthModule],
  imports: [AuthModule],
  providers: [],
})
export class PortailAdminLoginModule {}
