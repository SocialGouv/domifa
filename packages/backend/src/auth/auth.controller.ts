import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Inject,
  Param,
  Post,
  Req,
  Request,
  Response
} from "@nestjs/common";
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
    const user = await this.usersService.findByEmail(loginDto.email);

    if (user) {
      const isValidPass = await bcrypt.compare(
        loginDto.password,
        user.password
      );
      if (isValidPass) {
        const accessToken = await this.authService.login(user);
        return res.status(HttpStatus.OK).json(accessToken);
      } else {
        throw new HttpException("USER_NOT_FOUND", HttpStatus.NOT_FOUND);
      }
    }

    return res
      .status(HttpStatus.FORBIDDEN)
      .json({ message: "WRONG_CREDENTIALS" });
  }

  @Get("validate/:token")
  public async validate(@Param("token") token: string): Promise<User> {
    const user = await this.usersService.findOneBy({ "token.email": token });
    if (!user || user === null) {
      throw new HttpException("Usager not found", HttpStatus.BAD_GATEWAY);
    }
    return this.usersService.updateOne(user.id, {
      "token.email": "",
      verified: true
    });
  }
}
