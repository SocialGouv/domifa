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
  ExpressRequest,
  ExpressResponse,
  getClientIp,
  getClientUserAgent,
} from "../../../../util/express";
import { UserAdminAuthenticated, UserProfile } from "../../../../_common/model";
import { StructureAdminLoginDto } from "../../../users/dto/structure-admin-login.dto";
import { AdminsAuthService } from "../../services/admins-auth.service";
import { userSecurityPasswordChecker } from "../../../users/services";
import { UserSupervisor } from "@domifa/common";
import { AuthGuard } from "@nestjs/passport";
import { USER_SUPERVISOR_ROLES } from "../../../../_common/model/users/user-supervisor";
import {
  AllowUserProfiles,
  AllowUserSupervisorRoles,
  CurrentUser,
} from "../../../../auth/decorators";
import { AppUserGuard } from "../../../../auth/guards";
import { SessionFingerprintService } from "../../../../auth/services/session-fingerprint.service";
import { portailAdminProfilBuilder } from "../../services/portail-admin-profil-builder.service";
import {
  ExpiredTokenTable,
  expiredTokenRepositiory,
} from "../../../../database";

const userProfile: UserProfile = "supervisor";
@Controller("portail-admins/auth")
@ApiTags("auth")
export class PortailAdminLoginController {
  constructor(
    private readonly adminsAuthService: AdminsAuthService,
    private readonly sessionFingerprintService: SessionFingerprintService
  ) {}

  @Post("login")
  @HttpCode(HttpStatus.OK)
  public async loginUser(
    @Req() req: ExpressRequest,
    @Res() res: ExpressResponse,
    @Body() loginDto: StructureAdminLoginDto
  ) {
    try {
      const user =
        await userSecurityPasswordChecker.checkPassword<UserSupervisor>({
          email: loginDto.email,
          password: loginDto.password,
          userProfile,
        });

      const accessToken = await this.adminsAuthService.login(user, {
        ipAddress: getClientIp(req),
        userAgent: getClientUserAgent(req),
      });
      return res.status(HttpStatus.OK).json(accessToken);
    } catch (err) {
      return res
        .status(HttpStatus.UNAUTHORIZED)
        .json({ message: "LOGIN_FAILED" });
    }
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard("jwt"), AppUserGuard)
  @AllowUserProfiles("supervisor")
  @AllowUserSupervisorRoles(...USER_SUPERVISOR_ROLES)
  @Get("logout")
  public async logout(
    @Req() req: ExpressRequest,
    @CurrentUser() user: UserAdminAuthenticated
  ) {
    const tokenToBlacklist = new ExpiredTokenTable({
      token: req.headers.authorization,
      userId: user.id,
      userProfile: user._userProfile,
    });
    await expiredTokenRepositiory.save(tokenToBlacklist);

    await this.sessionFingerprintService.closeActiveSession(
      "supervisor",
      user.id,
      "MANUAL_LOGOUT"
    );

    return true;
  }

  @Get("me")
  @UseGuards(AuthGuard("jwt"), AppUserGuard)
  @AllowUserProfiles("supervisor")
  @AllowUserSupervisorRoles(...USER_SUPERVISOR_ROLES)
  public async meAdmin(@CurrentUser() currentUser: UserAdminAuthenticated) {
    return await portailAdminProfilBuilder.build({
      userId: currentUser._userId,
    });
  }
}
