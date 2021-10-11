import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { PortailUsagerLoginModule } from "./portail-usager-login";
import { PortailUsagerProfilModule } from "./portail-usager-profil";

@Module({
  controllers: [],
  exports: [PortailUsagerProfilModule, PortailUsagerLoginModule],
  imports: [PortailUsagerProfilModule, PortailUsagerLoginModule, AuthModule],
  providers: [],
})
export class PortailUsagerModule {}
