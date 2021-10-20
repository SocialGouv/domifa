import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Res,
  UseGuards,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ApiTags } from "@nestjs/swagger";
import { AllowUserProfiles, CurrentUser } from "../../auth/decorators";
import { AppUserGuard } from "../../auth/guards";
import { ExpressResponse } from "../../util/express";
import {
  PortailUsagerProfile,
  UserUsagerAuthenticated,
} from "../../_common/model";
import { portailUsagerProfilBuilder } from "./services/portail-usager-profil-builder.service";

@Controller("portail-usagers/profile")
@UseGuards(AuthGuard("jwt"), AppUserGuard)
@ApiTags("profile")
export class PortailUsagersProfileController {
  constructor() {}

  @Get("me")
  @AllowUserProfiles("usager")
  @HttpCode(HttpStatus.OK)
  public async meUsager(
    @Res() res: ExpressResponse,
    @CurrentUser() currentUser: UserUsagerAuthenticated
  ) {
    const portailUsagerProfile: PortailUsagerProfile =
      await portailUsagerProfilBuilder.build({
        usagerUUID: currentUser.usager.uuid,
      });

    return res.status(HttpStatus.OK).json(portailUsagerProfile);
  }
}
