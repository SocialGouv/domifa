import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { UsersService } from "../users/services/users.service";
import { User } from "../users/user.interface";
import { JwtPayload } from "./jwt-payload.interface";
import { StructuresService } from "../structures/services/structures.service";

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly structuresService: StructuresService,
    private readonly usersService: UsersService
  ) {}

  public async login(user: User) {
    const payload = {
      email: user.email,
      id: user.id,
      lastLogin: user.lastLogin,
      nom: user.nom,
      prenom: user.prenom,
      role: user.role,
      structure: user.structure,
    };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  public async validateUser(payload: JwtPayload): Promise<any> {
    const user = await this.usersService.findOne({ id: payload.id });

    if (!user || user === null) {
      return false;
    }

    const structureUpdated = await this.structuresService.updateLastLogin(
      user.structureId
    );
    const userUpdated = await this.usersService.update(
      user.id,
      user.structureId,
      {
        lastLogin: new Date(),
      }
    );

    return user;
  }
}
