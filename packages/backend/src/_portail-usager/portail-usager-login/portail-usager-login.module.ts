import { Module } from "@nestjs/common";
import { AuthModule } from "../../auth/auth.module";
import { PortailUsagersLoginController } from "./portail-usagers-login.controller";

@Module({
  controllers: [PortailUsagersLoginController],
  exports: [],
  imports: [AuthModule],
  providers: [],
})
export class PortailUsagerLoginModule {}
