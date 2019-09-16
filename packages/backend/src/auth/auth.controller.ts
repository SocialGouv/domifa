import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Response,
  UseGuards
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import * as bcrypt from "bcryptjs";
import { Model } from "mongoose";
import { LoginDto } from "../users/dto/login.dto";
import { User } from "../users/user.interface";
import { UsersService } from "../users/users.service";
import { AuthService } from "./auth.service";

@Controller("auth")
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService
  ) {}

  @Post("login")
  @HttpCode(HttpStatus.OK)
  public async loginUser(@Response() res: any, @Body() loginDto: LoginDto) {
    const user = await this.usersService.findOne({ email: loginDto.email });
    if (user) {
      const isValidPass = await bcrypt.compare(
        loginDto.password,
        user.password
      );

      if (!user.verified) {
        return res
          .status(HttpStatus.FORBIDDEN)
          .json({ message: "ACCOUNT_NOT_ACTIVATED" });
      }

      if (isValidPass) {
        const accessToken = await this.authService.login(user);
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
  @Get("me")
  public me(@Response() res: any, @Req() request: any) {
    const user = request.user;
    return res.status(HttpStatus.OK).json({
      email: user.email,
      id: user.id,
      nom: user.nom,
      prenom: user.prenom,
      role: user.role,
      structure: user.structure,
      structureId: user.structureId
    });
  }
}
