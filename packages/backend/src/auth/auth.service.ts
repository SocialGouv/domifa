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
    private readonly usersService: UsersService
  ) {}

  public async login(user: any) {
    const payload = {
      email: user.email,
      id: user.id,
      nom: user.nom,
      prenom: user.prenom,
      role: user.role,
      structureId: user.structureId
    };
    return {
      access_token: this.jwtService.sign(payload)
    };
  }
  public async validateUser(payload: JwtPayload): Promise<any> {
    return this.usersService.findById(payload.id);
  }
}
