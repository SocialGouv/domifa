import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Response,
  UseGuards,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

import * as bcrypt from "bcryptjs";
import { LoginDto } from "../users/dto/login.dto";
import { UsersService } from "../users/services/users.service";
import { User } from "../users/user.interface";
import { AuthService } from "./auth.service";
import { CurrentUser } from "./current-user.decorator";

@Controller("auth")
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService
  ) {}

  @Post("login")
  @HttpCode(HttpStatus.OK)
  public async loginUser(@Response() res: any, @Body() loginDto: LoginDto) {
    const user: User = await this.usersService.findOne({
      email: loginDto.email.toLowerCase(),
    });

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

        this.usersService.update(user.id, user.structureId, {
          lastLogin: new Date(),
        });

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

  @UseGuards(AuthGuard("jwt"))
  @Get("domifa")
  public authDomifa(@Response() res: any, @CurrentUser() user: User) {
    if (
      !user ||
      user === null ||
      (user.structureId !== 28 && user.structureId !== 1)
    ) {
      return res.status(HttpStatus.UNAUTHORIZED).json({});
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

  @UseGuards(AuthGuard("jwt"))
  @Get("me")
  public me(@Response() res: any, @Req() request: any) {
    const user = request.user;
    if (!user || user === null) {
      return res.status(HttpStatus.UNAUTHORIZED).json({});
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
