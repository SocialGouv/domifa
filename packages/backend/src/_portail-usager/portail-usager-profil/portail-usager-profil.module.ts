import { HttpModule } from "@nestjs/axios";
import { forwardRef, Module } from "@nestjs/common";
import { AuthModule } from "../../auth/auth.module";
import { PortailUsagersProfileController } from "./portail-usagers-profile.controller";

@Module({
  controllers: [PortailUsagersProfileController],
  exports: [],
  imports: [HttpModule, forwardRef(() => AuthModule)],
  providers: [],
})
export class PortailUsagerProfilModule {}
