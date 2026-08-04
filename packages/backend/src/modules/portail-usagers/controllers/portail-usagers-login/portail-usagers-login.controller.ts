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
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import {
  ExpiredTokenTable,
  UserUsagerLoginTable,
  expiredTokenRepositiory,
  usagerRepository,
  userUsagerLoginRepository,
  userUsagerRepository,
  structureRepository,
} from "../../../../database";
import { EditMyPasswordDto, UsagerLoginDto } from "../../../users/dto";
import {
  ExpressRequest,
  ExpressResponse,
  buildSecurityLogRequestContext,
  getClientIp,
  getClientUserAgent,
} from "../../../../util/express";

import { UsagersAuthService } from "../../services/usagers-auth.service";
import {
  getPasswordChangeStatus,
  PortailUsagerProfile,
  PortailUsagerAuthApiResponse,
} from "@domifa/common";
import { UserUsagerAuthenticated } from "../../../../_common/model";
import { AllowUserProfiles, CurrentUser } from "../../../../auth/decorators";
import { AuthGuard } from "@nestjs/passport";
import { AppUserGuard } from "../../../../auth/guards";
import {
  userUsagerSecurityPasswordChecker,
  userUsagerSecurityPasswordUpdater,
} from "../../services/user-usager-security";
import { logSecurityEventForUser } from "../../../app-logs/app-log-security-writer";
import { appLogger } from "../../../../util";

@Controller("portail-usagers/auth")
@ApiTags("auth")
export class PortailUsagersLoginController {
  constructor(private readonly usagersAuthService: UsagersAuthService) {}

  @Post("login")
  @HttpCode(HttpStatus.OK)
  public async loginUser(
    @Req() req: ExpressRequest,
    @Res() res: ExpressResponse,
    @Body() loginDto: UsagerLoginDto
  ) {
    try {
      const user = await userUsagerSecurityPasswordChecker.checkPassword({
        login: loginDto.login,
        password: loginDto.password,
        newPassword: loginDto.newPassword as string,
        requestContext: {
          ip: getClientIp(req),
          userAgent: getClientUserAgent(req),
        },
      });

      const passwordChangeStatus = getPasswordChangeStatus(
        user.passwordLastUpdate,
        user.createdAt
      );

      if (
        user.passwordType !== "PERSONAL" ||
        passwordChangeStatus === "EXPIRED"
      ) {
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
        passwordLastUpdate: user.passwordLastUpdate,
        createdAt: user.createdAt,
      };

      const structure = await structureRepository.findOneByOrFail({
        id: user.structureId,
      });

      await userUsagerLoginRepository.save(
        new UserUsagerLoginTable({
          usagerUUID: usager.uuid,
          structureId: user.structureId,
        })
      );

      if (structure.portailUsager.usagerLoginUpdateLastInteraction) {
        usager.lastInteraction.dateInteraction = new Date();
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
      if (err?.message === "NEW_PASSWORD_SAME_AS_OLD") {
        return res
          .status(HttpStatus.BAD_REQUEST)
          .json({ message: "NEW_PASSWORD_SAME_AS_OLD" });
      }
      const message =
        err?.message === "BLOCKED_TEMP" ? "BLOCKED_TEMP" : "USAGER_LOGIN_FAIL";
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

    await logSecurityEventForUser(
      "LOGOUT",
      "usager",
      {
        id: user.user.id,
        structureId: user.user.structureId,
        login: user.user.login,
      },
      {
        requestContext: {
          ip: getClientIp(req),
          userAgent: getClientUserAgent(req),
        },
      }
    );

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

  // Edition d'un mot de passe quand on est déjà connecté (depuis "Gérer mon compte")
  @ApiBearerAuth()
  @UseGuards(AuthGuard("jwt"), AppUserGuard)
  @AllowUserProfiles("usager")
  @ApiOperation({ summary: "Edition du mot de passe depuis le compte usager" })
  @Post("edit-my-password")
  public async editPassword(
    @Req() req: ExpressRequest,
    @CurrentUser() currentUser: UserUsagerAuthenticated,
    @Res() res: ExpressResponse,
    @Body() editPasswordDto: EditMyPasswordDto
  ) {
    try {
      await userUsagerSecurityPasswordUpdater.updatePassword({
        userId: currentUser.user.id,
        oldPassword: editPasswordDto.oldPassword,
        newPassword: editPasswordDto.password,
        requestContext: buildSecurityLogRequestContext(req),
      });
      return res.status(HttpStatus.OK).json({ message: "OK" });
    } catch (err) {
      appLogger.error(err);
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json({ message: "EDIT_PASSWORD_FAIL" });
    }
  }
}
