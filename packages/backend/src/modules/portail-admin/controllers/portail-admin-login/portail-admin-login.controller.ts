import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpException,
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
import { portailAdminProfilBuilder } from "../../services/portail-admin-profil-builder.service";
import {
  ExpiredTokenTable,
  expiredTokenRepositiory,
} from "../../../../database";
import { OtpService } from "../../../otp/services/otp.service";
import { normalizeUrl, readOtpCode } from "../../../otp/guards/otp.guard";
import { computeOtpFingerprint } from "../../../otp/otp-fingerprint.helper";
import { OtpRequestContext } from "../../../otp/otp.types";
import { logSecurityEventForUser } from "../../../app-logs/app-log-security-writer";
import { appLogger } from "../../../../util";

const userProfile: UserProfile = "supervisor";
@Controller("portail-admins/auth")
@ApiTags("auth")
export class PortailAdminLoginController {
  constructor(
    private readonly adminsAuthService: AdminsAuthService,
    private readonly otpService: OtpService
  ) {}

  @Post("login")
  @HttpCode(HttpStatus.OK)
  public async loginUser(
    @Req() req: ExpressRequest,
    @Res() res: ExpressResponse,
    @Body() loginDto: StructureAdminLoginDto
  ) {
    let user: UserSupervisor;
    try {
      user = await userSecurityPasswordChecker.checkPassword<UserSupervisor>({
        email: loginDto.email,
        password: loginDto.password,
        userProfile,
        requestContext: {
          ip: getClientIp(req),
          userAgent: getClientUserAgent(req),
        },
      });
    } catch (err) {
      appLogger.error("PortailAdminLoginController.loginUser failed", {
        error: err,
        context: { email: loginDto?.email },
      });
      // Anti-enumeration: no OTP is generated when credentials fail, so
      // unknown emails and wrong passwords look the same to a caller.
      // The lockout branch is the only one we surface explicitly, since
      // the front-end needs to display "compte temporairement bloqué".
      const message =
        (err as Error)?.message === "BLOCKED_TEMP"
          ? "BLOCKED_TEMP"
          : "LOGIN_FAILED";
      return res.status(HttpStatus.UNAUTHORIZED).json({ message });
    }

    const userUuid = user.uuid;
    if (!userUuid) {
      // OTP scoping relies on user.uuid (fingerprint hash + DB row). Refuse
      // the login rather than silently bypass the second factor for legacy
      // accounts that pre-date uuid backfill.
      return res
        .status(HttpStatus.UNAUTHORIZED)
        .json({ message: "LOGIN_FAILED" });
    }

    try {
      const otpContext = buildLoginOtpContext(
        req,
        user.email,
        userUuid,
        user.prenom,
        user.id
      );
      const code = readOtpCode(req);
      await this.otpService.enforceOrThrow(otpContext, code);
    } catch (err) {
      if (err instanceof HttpException) {
        return res.status(err.getStatus()).json(err.getResponse());
      }
      throw err;
    }

    const accessToken = await this.adminsAuthService.login(user, {
      ipAddress: getClientIp(req),
      userAgent: getClientUserAgent(req),
    });

    await logSecurityEventForUser("LOGIN_SUCCESS", userProfile, user, {
      requestContext: {
        ip: getClientIp(req),
        userAgent: getClientUserAgent(req),
      },
    });

    return res.status(HttpStatus.OK).json(accessToken);
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

    await logSecurityEventForUser(
      "LOGOUT",
      "supervisor",
      { id: user.id, role: user.role, nom: user.nom, prenom: user.prenom },
      {
        requestContext: {
          ip: getClientIp(req),
          userAgent: getClientUserAgent(req),
        },
      }
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

function buildLoginOtpContext(
  req: ExpressRequest,
  email: string,
  uuid: string,
  prenom: string,
  userId: number
): OtpRequestContext {
  const url = normalizeUrl(req);
  return {
    fingerprintHash: computeOtpFingerprint(
      { uuid, email, prenom, _userProfile: userProfile },
      "LOGIN",
      url
    ),
    url,
    purpose: "LOGIN",
    email,
    prenom,
    userType: userProfile,
    userUuid: uuid,
    userId,
    ip: getClientIp(req),
    userAgent: getClientUserAgent(req),
  };
}
