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
import { UserUsagerAuthenticated } from "../../_common/model";
import { usagerRepository } from "../../database";

@Controller("portail-usagers/profile")
@UseGuards(AuthGuard("jwt"), AppUserGuard)
@ApiTags("profile")
export class PortailUsagersProfileController {
  @Get("me")
  @AllowUserProfiles("usager")
  @HttpCode(HttpStatus.OK)
  public async meUsager(
    @Res() res: ExpressResponse,
    @CurrentUser() currentUser: UserUsagerAuthenticated
  ) {
    const usager = await usagerRepository.getUserUsagerData({
      usagerUUID: currentUser.usager.uuid,
    });

    return res.status(HttpStatus.OK).json({
      usager,
      acceptTerms: currentUser.user.acceptTerms,
    });
  }
}
