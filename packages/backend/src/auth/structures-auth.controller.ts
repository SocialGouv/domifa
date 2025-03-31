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
import { AuthGuard } from "@nestjs/passport";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Response } from "express";
import { domifaConfig } from "../config";
import { userStructureSecurityPasswordChecker } from "../database/services/app-log/user-structure-security/userStructureSecurityPasswordChecker.service";
import { StructureLoginDto } from "../users/dto";
import { ExpressRequest, ExpressResponse } from "../util/express";
import { UserStructureAuthenticated } from "../_common/model";
import { AllowUserProfiles } from "./decorators/AllowUserProfiles.decorator";
import { CurrentUser } from "./decorators/current-user.decorator";
import { AppUserGuard } from "./guards/AppUserGuard.guard";
import { StructuresAuthService } from "./services/structures-auth.service";
import { ExpiredTokenTable, expiredTokenRepositiory } from "../database";

@Controller("structures/auth")
@ApiTags("auth")
export class StructuresAuthController {
  constructor(private readonly structuresAuthService: StructuresAuthService) {}

  @Post("login")
  @HttpCode(HttpStatus.OK)
  public async loginUser(
    @Res() res: ExpressResponse,
    @Body() loginDto: StructureLoginDto
  ) {
    try {
      const user = await userStructureSecurityPasswordChecker.checkPassword({
        email: loginDto.email,
        password: loginDto.password,
      });

      const accessToken = this.structuresAuthService.login(user);

      return res.status(HttpStatus.OK).json(accessToken);
    } catch (err) {
      return res
        .status(HttpStatus.UNAUTHORIZED)
        .json({ message: "LOGIN_FAILED" });
    }
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard("jwt"), AppUserGuard)
  @AllowUserProfiles("structure")
  @ApiOperation({ summary: "Déconnexion" })
  @Get("logout")
  public async logout(
    @Req() req: ExpressRequest,
    @CurrentUser() user: UserStructureAuthenticated
  ) {
    const tokenToBlacklist = new ExpiredTokenTable({
      token: req.headers.authorization,
      userId: user.id,
      structureId: user.structure.id,
      userProfile: user.isSuperAdminDomifa ? "super-admin-domifa" : "structure",
    });
    await expiredTokenRepositiory.save(tokenToBlacklist);
    return true;
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard("jwt"), AppUserGuard)
  @AllowUserProfiles("structure")
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
      acceptTerms: user.acceptTerms,
      structure: user.structure,
      structureId: user.structureId,
      domifaVersion: domifaConfig().version.toString(),
    });
  }
}
