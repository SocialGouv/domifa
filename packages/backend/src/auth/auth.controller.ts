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
import * as bcrypt from "bcryptjs";
import { usersRepository } from "../database";
import { LoginDto } from "../users/dto/login.dto";

import { ExpressResponse } from "../util/express";
import { AppAuthUser, AppUser } from "../_common/model";
import { AuthService } from "./auth.service";
import { CurrentUser } from "./current-user.decorator";
import { DomifaGuard } from "./guards/domifa.guard";

import { Response } from "express";

@Controller("auth")
@ApiTags("auth")
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post("login")
  @HttpCode(HttpStatus.OK)
  public async loginUser(@Res() res: Response, @Body() loginDto: LoginDto) {
    const user = await usersRepository.findOne<AppUser>(
      { email: loginDto.email.toLowerCase() },
      { select: "ALL" }
    );

    if (user) {
      const isValidPass = await bcrypt.compare(
        loginDto.password,
        user.password
      );

      if (isValidPass) {
        if (!user.verified) {
          return res
            .status(HttpStatus.FORBIDDEN)
            .json({ message: "ACCOUNT_NOT_ACTIVATED" });
        }

        const accessToken = await this.authService.login(user);

        usersRepository.updateOne(
          {
            id: user.id,
            structureId: user.structureId,
          },
          {
            lastLogin: new Date(),
          }
        );

        return res.status(HttpStatus.OK).json(accessToken);
      } else {
        return res
          .status(HttpStatus.FORBIDDEN)
          .json({ message: "WRONG_CREDENTIALS" });
      }
    }
    return res
      .status(HttpStatus.FORBIDDEN)
      .json({ message: "WRONG_CREDENTIALS" });
  }

  @UseGuards(AuthGuard("jwt"), DomifaGuard)
  @ApiBearerAuth()
  @Get("domifa")
  public authDomifa(@Res() res: ExpressResponse) {
    return res.status(HttpStatus.OK).json();
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard("jwt"))
  @Get("me")
  public me(@Res() res: Response, @CurrentUser() user: AppAuthUser) {
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
