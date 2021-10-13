import { Module } from "@nestjs/common";
import { AuthModule } from "../../auth/auth.module";
import { PortailUsagersLoginController } from "./portail-usagers-login.controller";
import { UsagersAuthService } from "./services";

@Module({
  controllers: [PortailUsagersLoginController],
  exports: [],
  imports: [AuthModule],
  providers: [UsagersAuthService],
})
export class PortailUsagerLoginModule {}
