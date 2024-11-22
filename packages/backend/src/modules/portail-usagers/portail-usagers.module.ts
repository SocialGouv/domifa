import { forwardRef, Module } from "@nestjs/common";
import { AuthModule } from "../../auth/auth.module";

import { InteractionsModule } from "../interactions/interactions.module";
import { HttpModule } from "@nestjs/axios";
import { InteractionsService } from "../interactions/services";
import { PortailUsagersLoginController } from "./controllers/portail-usagers-login/portail-usagers-login.controller";
import { PortailUsagersProfileController } from "./controllers/postail-usagers-profile/portail-usagers-profile.controller";
import { PortailUsagersManagerController } from "./controllers/portail-usagers-manager/portail-usagers-manager.controller";
import { AppLogsService } from "../app-logs/app-logs.service";
import { StructureInformationController } from "./controllers/structure-information/structure-information.controller";
import { FileManagerService } from "../../util/file-manager/file-manager.service";
import { AppLogsModule } from "../app-logs/app-logs.module";

@Module({
  controllers: [
    PortailUsagersProfileController,
    PortailUsagersLoginController,
    PortailUsagersManagerController,
    StructureInformationController,
  ],
  providers: [FileManagerService, InteractionsService, AppLogsService],
  imports: [
    AuthModule,
    InteractionsModule,
    HttpModule,
    forwardRef(() => AuthModule),
    forwardRef(() => AppLogsModule),
    forwardRef(() => InteractionsModule),
  ],
})
export class PortailUsagersModule {}
