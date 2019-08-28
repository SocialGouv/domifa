import { Inject, Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Model } from "mongoose";
import { ConfigService } from "../config/config.service";
import { User } from "../users/user.interface";
import { UsersService } from "../users/users.service";
import { JwtPayload } from "./jwt-payload.interface";

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UsersService
  ) {}

  public async createToken(email, roles) {
    const config = new ConfigService();
    const secret = config.get("SECRET");
    const expiresIn = 36000;

    const userInfo = { email, roles };

    const token = this.jwtService.sign(userInfo);
    return {
      access_token: token,
      expires_in: expiresIn
    };
  }
}
