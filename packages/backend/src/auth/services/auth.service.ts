import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import {
  userStructureRepository,
  UserStructureTable,
  structureCommonRepository,
} from "../../database";
import { StructuresService } from "../../structures/services/structures.service";
import { appLogger } from "../../util";
import {
  UserStructurePublic,
  UserStructure,
  UserStructureAuthenticated,
  StructureCommon,
} from "../../_common/model";
import { JwtPayload } from "../jwt-payload.interface";

export const APP_USER_PUBLIC_ATTRIBUTES: (keyof UserStructurePublic)[] = [
  "id",
  "prenom",
  "nom",
  "email",
  "verified",
  "structureId",
  "fonction",
  "role",
];

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly structuresService: StructuresService
  ) {}

  public async login(user: UserStructure) {
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

  public async validateUser(
    payload: JwtPayload
  ): Promise<false | UserStructureAuthenticated> {
    const authUser = await this.findAuthUser({ id: payload.id });

    if (!authUser || authUser === null) {
      return false;
    }

    // update structure & user last login date
    await this.structuresService.updateLastLogin(authUser.structureId);
    await userStructureRepository.updateOne(
      {
        id: authUser.id,
        structureId: authUser.structureId,
      },
      {
        lastLogin: new Date(),
      }
    );

    return authUser;
  }
  public async findAuthUser(
    criteria: Partial<UserStructureTable>
  ): Promise<UserStructureAuthenticated> {
    const user = await userStructureRepository.findOne<UserStructurePublic>(
      criteria,
      {
        select: APP_USER_PUBLIC_ATTRIBUTES,
      }
    );

    if (typeof user.structureId === "undefined") {
      appLogger.debug("[TRACK BUG] " + JSON.stringify(user));
    }

    const structure: StructureCommon = await structureCommonRepository.findOne({
      id: user.structureId,
    });

    return {
      ...user,
      structure,
    };
  }
}
