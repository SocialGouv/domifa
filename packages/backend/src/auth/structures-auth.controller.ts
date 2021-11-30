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
import { AuthGuard } from "@nestjs/passport";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { Response } from "express";
import { userStructureSecurityPasswordChecker } from "../database/services/user-structure/user-structure-security/userStructureSecurityPasswordChecker.service";
import { StructureLoginDto } from "../users/dto";
import { ExpressResponse } from "../util/express";
import { UserStructureAuthenticated } from "../_common/model";
import { AllowUserProfiles } from "./decorators/AllowUserProfiles.decorator";
import { CurrentUser } from "./decorators/current-user.decorator";
import { AppUserGuard } from "./guards/AppUserGuard.guard";
import { StructuresAuthService } from "./services/structures-auth.service";

@Controller("structures/auth")
@ApiTags("auth")
export class StructuresAuthController {
  constructor(private structuresAuthService: StructuresAuthService) {}

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

      const accessToken = await this.structuresAuthService.login(user);
      return res.status(HttpStatus.OK).json(accessToken);
    } catch (err) {
      return res
        .status(HttpStatus.UNAUTHORIZED)
        .json({ message: "WRONG_CREDENTIALS" });
    }
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard("jwt"), AppUserGuard)
  @AllowUserProfiles("structure")
  @Get("me")
  public me(
    @Res() res: Response,
    @CurrentUser() user: UserStructureAuthenticated
  ) {
    if (!user || user === null) {
      return res.status(HttpStatus.UNAUTHORIZED).json();
    }

    return res.status(HttpStatus.OK).json({
      email: user.email,
      id: user.id,
      lastLogin: user.lastLogin,
      nom: user.nom,
      prenom: user.prenom,
      role: user.role,
      structure: user.structure,
      structureId: user.structureId,
    });
  }
}
