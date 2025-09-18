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

import { StructureLoginDto } from "../modules/users/dto";
import { ExpressRequest, ExpressResponse } from "../util/express";
import { UserProfile, UserStructureAuthenticated } from "../_common/model";
import { AllowUserProfiles } from "./decorators/AllowUserProfiles.decorator";
import { CurrentUser } from "./decorators/current-user.decorator";
import { AppUserGuard } from "./guards/AppUserGuard.guard";
import { StructuresAuthService } from "./services/structures-auth.service";
import { ExpiredTokenTable, expiredTokenRepositiory } from "../database";
import { domifaConfig } from "../config";
import { userSecurityPasswordChecker } from "../modules/users/services";
import { AllowUserStructureRoles } from "./decorators";
import { ALL_USER_STRUCTURE_ROLES, UserStructure } from "@domifa/common";
import { appLogger } from "../util";

const userProfile: UserProfile = "structure";

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
      const user =
        await userSecurityPasswordChecker.checkPassword<UserStructure>({
          email: loginDto.email,
          password: loginDto.password,
          userProfile,
        });

      const accessToken = this.structuresAuthService.login(user);

      return res.status(HttpStatus.OK).json(accessToken);
    } catch (err) {
      appLogger.error(err);
      return res
        .status(HttpStatus.UNAUTHORIZED)
        .json({ message: "LOGIN_FAILED" });
    }
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard("jwt"), AppUserGuard)
  @AllowUserProfiles("structure")
  @AllowUserStructureRoles(...ALL_USER_STRUCTURE_ROLES)
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
      userProfile: user._userProfile,
    });
    await expiredTokenRepositiory.save(tokenToBlacklist);
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
