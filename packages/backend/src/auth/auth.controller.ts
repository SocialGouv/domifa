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
import { userSecurityPasswordChecker } from "../database";
import { LoginDto } from "../users/dto/login.dto";
import { ExpressResponse } from "../util/express";
import { UserStructureAuthenticated } from "../_common/model";
import { AuthService } from "./auth.service";
import { CurrentUser } from "./current-user.decorator";
import { AllowUserProfiles, AppUserGuard } from "./guards";

@Controller("auth")
@ApiTags("auth")
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post("login")
  @HttpCode(HttpStatus.OK)
  public async loginUser(@Res() res: Response, @Body() loginDto: LoginDto) {
    try {
      const user = await userSecurityPasswordChecker.checkPassword({
        email: loginDto.email,
        password: loginDto.password,
      });

      const accessToken = await this.authService.login(user);
      return res.status(HttpStatus.OK).json(accessToken);
    } catch (err) {
      return res.status(HttpStatus.UNAUTHORIZED).json({ message: err.message });
    }
  }

  @UseGuards(AuthGuard("jwt"), AppUserGuard)
  @AllowUserProfiles("super-admin-domifa")
  @ApiBearerAuth()
  @Get("domifa")
  public authDomifa(@Res() res: ExpressResponse) {
    return res.status(HttpStatus.OK).json();
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard("jwt"))
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
