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
import { AuthGuard } from "@nestjs/passport";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { Response } from "express";

import { StructureLoginDto } from "../modules/users/dto";
import {
  ExpressRequest,
  ExpressResponse,
  getClientIp,
  getClientUserAgent,
} from "../util/express";
import { UserProfile, UserStructureAuthenticated } from "../_common/model";
import { AllowUserProfiles } from "./decorators/AllowUserProfiles.decorator";
import { CurrentUser } from "./decorators/current-user.decorator";
import { AppUserGuard } from "./guards/AppUserGuard.guard";
import { LoginOtpService } from "./services/login-otp.service";
import { StructuresAuthService } from "./services/structures-auth.service";
import { readOtpCode } from "../modules/otp/guards/otp.guard";
import { ExpiredTokenTable, expiredTokenRepositiory } from "../database";
import { domifaConfig } from "../config";
import { userSecurityPasswordChecker } from "../modules/users/services";
import { AllowUserStructureRoles } from "./decorators";
import { ALL_USER_STRUCTURE_ROLES, UserStructure } from "@domifa/common";
import { appLogger } from "../util";
import { logSecurityEventForUser } from "../modules/app-logs/app-log-security-writer";
import { revokeSupportSessionOnStructureLogout } from "../modules/portail-admin/services/support-session/support-session-closer";

const userProfile: UserProfile = "structure";

// Duplicate of the trust JWT stored client-side. Kept aligned with
// STRUCTURE_TRUST_JWT_TTL_SECONDS so a browser that clears localStorage
// but keeps cookies (and vice-versa) still finds the token on the next
// login.
const TRUST_COOKIE_NAME = "dm_trust";
const TRUST_COOKIE_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;

function trustCookieOptions() {
  const isProd = !["dev", "local", "test"].includes(domifaConfig().envId);
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax" as const,
    path: "/structures/auth",
    maxAge: TRUST_COOKIE_MAX_AGE_MS,
  };
}

function readStructureTrustCookie(req: ExpressRequest): string | undefined {
  const raw = req.cookies?.[TRUST_COOKIE_NAME];
  return typeof raw === "string" && raw.length > 0 ? raw : undefined;
}

@Controller("structures/auth")
@ApiTags("auth")
export class StructuresAuthController {
  constructor(
    private readonly structuresAuthService: StructuresAuthService,
    private readonly loginOtpService: LoginOtpService
  ) {}

  @Post("login")
  @HttpCode(HttpStatus.OK)
  public async loginUser(
    @Req() req: ExpressRequest,
    @Res() res: ExpressResponse,
    @Body() loginDto: StructureLoginDto
  ) {
    const ip = getClientIp(req);
    const userAgent = getClientUserAgent(req);

    let user: UserStructure;
    try {
      user = await userSecurityPasswordChecker.checkPassword<UserStructure>({
        email: loginDto.email,
        password: loginDto.password,
        userProfile,
        requestContext: { ip, userAgent },
      });
    } catch (err) {
      appLogger.error("StructuresAuthController.loginUser failed", {
        error: err,
        context: { userProfile, email: loginDto?.email },
      });
      const message =
        (err as Error)?.message === "BLOCKED_TEMP"
          ? "BLOCKED_TEMP"
          : "LOGIN_FAILED";
      return res.status(HttpStatus.UNAUTHORIZED).json({ message });
    }

    try {
      // Test bypass: every security suite authenticates structure users via
      // AppTestHelper.authenticateStructure. Forcing each one through the
      // full OTP cycle (prime → claim) only exercises the OTP plumbing that
      // login-otp.service.spec.ts already covers, while making every URL
      // check fail at the login step. envId can only be "test" when the
      // backend is started against the test database — prod/preprod/dev
      // paths are unchanged.
      if (domifaConfig().envId === "test") {
        const { access_token, trustToken } =
          await this.structuresAuthService.login(user, {
            ipAddress: ip,
            userAgent,
          });
        res.cookie(TRUST_COOKIE_NAME, trustToken, trustCookieOptions());
        return res.status(HttpStatus.OK).json({ access_token });
      }

      // Belt-and-suspenders trust token retrieval: legacy path via body
      // (localStorage), backup path via httpOnly cookie (survives a
      // localStorage wipe / private mode). Body wins so a freshly rotated
      // token from the last login still takes precedence.
      const trustTokenFromRequest =
        loginDto.trustToken ?? readStructureTrustCookie(req);

      const result = await this.loginOtpService.evaluate({
        user: {
          id: user.id,
          uuid: user.uuid,
          email: user.email,
          prenom: user.prenom,
          structureId: user.structureId,
        },
        ip,
        userAgent,
        trustToken: trustTokenFromRequest,
        // OtpInterceptor on the front-end retries 401 OTP_REQUIRED with the
        // Otp-Code header — read it server-side via the same helper as
        // OtpGuard so a malformed payload is treated as "no code".
        otpCode: readOtpCode(req) ?? undefined,
      });

      const { access_token, trustToken } =
        result.kind === "trusted"
          ? this.structuresAuthService.signForExistingSession(
              user,
              result.session
            )
          : await this.structuresAuthService.login(user, {
              ipAddress: ip,
              userAgent,
            });

      await logSecurityEventForUser("LOGIN_SUCCESS", userProfile, user, {
        requestContext: { ip, userAgent },
        context: { otpFlow: result.kind },
      });

      res.cookie(TRUST_COOKIE_NAME, trustToken, trustCookieOptions());
      return res.status(HttpStatus.OK).json({ access_token });
    } catch (err) {
      // OTP errors are HttpExceptions raised by LoginOtpService/OtpService
      // with an ApiMessage body. Re-throw as-is; the front discriminates
      // on `message` (an OtpErrorCode).
      if (err instanceof HttpException) {
        throw err;
      }
      appLogger.error("StructuresAuthController.loginUser OTP step failed", {
        error: err,
        context: { userProfile, email: loginDto?.email },
      });
      // The password already checked out: reporting a server-side failure of
      // the OTP step as LOGIN_FAILED would send the user chasing a credential
      // problem they don't have.
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ message: "OTP_UNAVAILABLE" });
    }
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard("jwt"), AppUserGuard)
  @AllowUserProfiles("structure")
  @AllowUserStructureRoles(...ALL_USER_STRUCTURE_ROLES)
  @Get("logout")
  public async logout(
    @Req() req: ExpressRequest,
    @CurrentUser() user: UserStructureAuthenticated
  ) {
    const tokenToBlacklist = new ExpiredTokenTable({
      token: req.headers.authorization,
      userId: user.id,
      structureId: user.structure.id,
      userProfile: user._userProfile,
    });
    await expiredTokenRepositiory.save(tokenToBlacklist);

    if (user.supportMode) {
      await revokeSupportSessionOnStructureLogout(user.id);
    }

    await logSecurityEventForUser(
      "LOGOUT",
      "structure",
      {
        id: user.id,
        structureId: user.structure.id,
        role: user.role,
        nom: user.nom,
        prenom: user.prenom,
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

  @ApiBearerAuth()
  @UseGuards(AuthGuard("jwt"), AppUserGuard)
  @AllowUserProfiles("structure")
  @AllowUserStructureRoles(...ALL_USER_STRUCTURE_ROLES)
  @Get("me")
  public me(
    @Res() res: Response,
    @CurrentUser() user: UserStructureAuthenticated
  ) {
    if (!user) {
      return res
        .status(HttpStatus.UNAUTHORIZED)
        .json({ message: "USER_NOT_FOUND" });
    }

    return res.status(HttpStatus.OK).json({
      email: user.email,
      uuid: user.uuid,
      id: user.id,
      lastLogin: user.lastLogin,
      nom: user.nom,
      prenom: user.prenom,
      role: user.role,
      fonction: user.fonction,
      fonctionDetail: user.fonctionDetail,
      acceptTerms: user.acceptTerms,
      structure: user.structure,
      structureId: user.structureId,
      domifaVersion: domifaConfig().version.toString(),
      supportMode: user.supportMode,
      supportSessionUuid: user.supportSessionUuid,
      supervisorEmail: user.supervisorEmail,
    });
  }
}
