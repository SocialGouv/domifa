import { HttpModule } from "@nestjs/axios";
import { forwardRef, Module } from "@nestjs/common";
import { AuthModule } from "../../auth/auth.module";
import { PortailUsagersProfileController } from "./portail-usagers-profile.controller";
import { InteractionsModule } from "../../interactions/interactions.module";
import { InteractionsService } from "../../interactions/services";

@Module({
  controllers: [PortailUsagersProfileController],
  imports: [
    HttpModule,
    forwardRef(() => AuthModule),
    forwardRef(() => InteractionsModule),
  ],
  providers: [InteractionsService],
})
export class PortailUsagerProfilModule {}
