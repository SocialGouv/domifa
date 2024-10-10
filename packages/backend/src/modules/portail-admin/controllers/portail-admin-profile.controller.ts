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
import { AllowUserProfiles, CurrentUser } from "../../../auth/decorators";
import { AppUserGuard } from "../../../auth/guards";
import { ExpressResponse } from "../../../util/express";
import {
  PortailAdminProfile,
  UserAdminAuthenticated,
} from "../../../_common/model";
import { portailAdminProfilBuilder } from "../services/portail-admin-profil-builder.service";

@Controller("portail-admins/profile")
@UseGuards(AuthGuard("jwt"), AppUserGuard)
@ApiTags("profile")
export class PortailAdminProfileController {
  @Get("me")
  @AllowUserProfiles("super-admin-domifa")
  @HttpCode(HttpStatus.OK)
  public async meAdmin(
    @Res() res: ExpressResponse,
    @CurrentUser() currentUser: UserAdminAuthenticated
  ) {
    const portailAdminProfile: PortailAdminProfile =
      await portailAdminProfilBuilder.build({
        userId: currentUser._userId,
      });

    return res.status(HttpStatus.OK).json(portailAdminProfile);
  }
}
