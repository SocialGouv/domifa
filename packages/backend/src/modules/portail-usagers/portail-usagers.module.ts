import { forwardRef, Module } from "@nestjs/common";
import { AuthModule } from "../../auth/auth.module";

import { InteractionsModule } from "../../interactions/interactions.module";
import { HttpModule } from "@nestjs/axios";
import { InteractionsService } from "../../interactions/services";
import { PortailUsagersLoginController } from "./controllers/portail-usagers-login/portail-usagers-login.controller";
import { PortailUsagersProfileController } from "./controllers/portail-usagers-profile.controller";
import { PortailUsagersManagerController } from "./controllers/portail-usagers-manager/portail-usagers-manager.controller";
import { AppLogsService } from "../app-logs/app-logs.service";

@Module({
  controllers: [
    PortailUsagersProfileController,
    PortailUsagersLoginController,
    PortailUsagersManagerController,
  ],
  providers: [InteractionsService, AppLogsService],
  imports: [
    AuthModule,
    InteractionsModule,
    HttpModule,
    forwardRef(() => AuthModule),
    forwardRef(() => InteractionsModule),
  ],
})
export class PortailUsagersModule {}
