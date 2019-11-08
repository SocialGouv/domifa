import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { UsersService } from "../users/services/users.service";
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
    const user = await this.usersService.findOne({ id: payload.id });
    if (!user || user === null) {
      return false;
    }
    return user;
  }
}
