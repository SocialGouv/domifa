import { structureRepository } from "../../../../database/services/structure/structureRepository.service";
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Res,
  UseGuards,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import {
  UserUsagerLoginTable,
  usagerRepository,
  userUsagerLoginRepository,
  userUsagerRepository,
} from "../../../../database";
import { UsagerLoginDto } from "../../../users/dto";
import { ExpressResponse } from "../../../../util/express";

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

      if (user.isTemporaryPassword) {
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
