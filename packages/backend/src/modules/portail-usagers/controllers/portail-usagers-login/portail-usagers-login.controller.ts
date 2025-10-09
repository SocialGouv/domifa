import { structureRepository } from "../../../../database/services/structure/structureRepository.service";
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import {
  ExpiredTokenTable,
  UserUsagerLoginTable,
  expiredTokenRepositiory,
  usagerRepository,
  userUsagerLoginRepository,
  userUsagerRepository,
} from "../../../../database";
import { UsagerLoginDto } from "../../../users/dto";
import { ExpressRequest, ExpressResponse } from "../../../../util/express";

import { UsagersAuthService } from "../../services/usagers-auth.service";
import {
  PortailUsagerProfile,
  PortailUsagerAuthApiResponse,
} from "@domifa/common";
import { UserUsagerAuthenticated } from "../../../../_common/model";
import { AllowUserProfiles, CurrentUser } from "../../../../auth/decorators";
import { AuthGuard } from "@nestjs/passport";
import { AppUserGuard } from "../../../../auth/guards";
import { userUsagerSecurityPasswordChecker } from "../../services/user-usager-security";

@Controller("portail-usagers/auth")
@ApiTags("auth")
export class PortailUsagersLoginController {
  constructor(private readonly usagersAuthService: UsagersAuthService) {}

  @Post("login")
  @HttpCode(HttpStatus.OK)
  public async loginUser(
    @Res() res: ExpressResponse,
    @Body() loginDto: UsagerLoginDto
  ) {
    try {
      const user = await userUsagerSecurityPasswordChecker.checkPassword({
        login: loginDto.login,
        password: loginDto.password,
        newPassword: loginDto.newPassword,
      });

      if (user.passwordType !== "PERSONAL") {
        return res
          .status(HttpStatus.UNAUTHORIZED)
          .json({ message: "CHANGE_PASSWORD_REQUIRED" });
      }

      const { access_token } = this.usagersAuthService.login(user);

      const usager = await usagerRepository.getUserUsagerData({
        usagerUUID: user.usagerUUID,
      });

      const portailUsagerProfile: PortailUsagerProfile = {
        usager,
        acceptTerms: user.acceptTerms,
      };

      const structure = await structureRepository.findOneByOrFail({
        id: user.structureId,
      });

      const lastLogin = await userUsagerLoginRepository.save(
        new UserUsagerLoginTable({
          usagerUUID: usager.uuid,
          structureId: user.structureId,
        })
      );

      if (structure.portailUsager.usagerLoginUpdateLastInteraction) {
        usager.lastInteraction.dateInteraction = lastLogin.createdAt;
        await usagerRepository.update(
          { uuid: usager.uuid },
          { lastInteraction: usager.lastInteraction }
        );
      }

      const response: PortailUsagerAuthApiResponse = {
        token: access_token,
        acceptTerms: user.acceptTerms,
        profile: portailUsagerProfile,
      };

      return res.status(HttpStatus.OK).json(response);
    } catch (err) {
      const message =
        err?.message === "TOO_MANY_ATTEMPTS"
          ? "TOO_MANY_ATTEMPTS"
          : "USAGER_LOGIN_FAIL";
      return res.status(HttpStatus.UNAUTHORIZED).json({ message });
    }
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard("jwt"), AppUserGuard)
  @AllowUserProfiles("usager")
  @Get("logout")
  public async logout(
    @Req() req: ExpressRequest,
    @CurrentUser() user: UserUsagerAuthenticated
  ) {
    const tokenToBlacklist = new ExpiredTokenTable({
      token: req.headers.authorization,
      userId: user.user.id,
      userProfile: user._userProfile,
    });
    await expiredTokenRepositiory.save(tokenToBlacklist);
    return true;
  }

  @AllowUserProfiles("usager")
  @UseGuards(AuthGuard("jwt"), AppUserGuard)
  @HttpCode(HttpStatus.OK)
  @Get("accept-terms")
  public async acceptTerms(
    @CurrentUser() currentUser: UserUsagerAuthenticated
  ): Promise<boolean> {
    await userUsagerRepository.update(
      { uuid: currentUser.user.uuid },
      { acceptTerms: new Date() }
    );

    return true;
  }
}
