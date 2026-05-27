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
import {
  readOtpCode,
  readOtpResendFlag,
} from "../modules/otp/guards/otp.guard";
import { ExpiredTokenTable, expiredTokenRepositiory } from "../database";
import { domifaConfig } from "../config";
import { userSecurityPasswordChecker } from "../modules/users/services";
import { AllowUserStructureRoles } from "./decorators";
import { ALL_USER_STRUCTURE_ROLES, UserStructure } from "@domifa/common";
import { appLogger } from "../util";
import { logSecurityEventForUser } from "../modules/app-logs/app-log-security-writer";

const userProfile: UserProfile = "structure";

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
        const accessToken = await this.structuresAuthService.login(user, {
          ipAddress: ip,
          userAgent,
        });
        return res.status(HttpStatus.OK).json(accessToken);
      }

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
        trustToken: loginDto.trustToken,
        // OtpInterceptor on the front-end retries 401 OTP_REQUIRED with the
        // Otp-Code header — read it server-side via the same helper as
        // OtpGuard so a malformed payload is treated as "no code".
        otpCode: readOtpCode(req) ?? undefined,
        forceResend: readOtpResendFlag(req),
      });

      const accessToken =
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

      return res.status(HttpStatus.OK).json(accessToken);
    } catch (err) {
      // OTP_REQUIRED / OTP_INVALID / OTP_BLOCKED are HttpExceptions raised by
      // LoginOtpService/OtpService. Re-throw as-is so Nest preserves their
      // status code and `{ code }` payload — the front discriminates on it.
      if (err instanceof HttpException) {
        throw err;
      }
      appLogger.error("StructuresAuthController.loginUser OTP step failed", {
        error: err,
        context: { userProfile, email: loginDto?.email },
      });
      return res
        .status(HttpStatus.UNAUTHORIZED)
        .json({ message: "LOGIN_FAILED" });
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
    });
  }
}
