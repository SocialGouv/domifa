import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import {
  structureCommonRepository,
  userStructureRepository,
} from "../../database";
import { appLogger } from "../../util";
import {
  StructureCommon,
  UserStructure,
  UserStructureAuthenticated,
  UserStructurePublic,
} from "../../_common/model";
import { CURRENT_JWT_PAYLOAD_VERSION } from "../jwt/CURRENT_JWT_PAYLOAD_VERSION.const";
import { UserStructureJwtPayload } from "../jwt/user-structure-jwt-payload.interface";
import { isDomifaAdmin } from "./auth-checker.service";

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
export class StructuresAuthService {
  constructor(private readonly jwtService: JwtService) {}

  public async login(user: UserStructure) {
    const isSuperAdminDomifa = isDomifaAdmin(user);

    const payload: UserStructureJwtPayload = {
      _jwtPayloadVersion: CURRENT_JWT_PAYLOAD_VERSION,
      _userId: user.id,
      _userProfile: isSuperAdminDomifa ? "super-admin-domifa" : "structure",
      email: user.email,
      id: user.id,
      lastLogin: user.lastLogin,
      nom: user.nom,
      prenom: user.prenom,
      role: user.role,
      structureId: user.structureId,
    };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  public async validateUser(
    payload: UserStructureJwtPayload
  ): Promise<false | UserStructureAuthenticated> {
    const authUser = await this.findAuthUser(payload);

    if (!authUser || authUser === null) {
      return false;
    }

    // update structure & user last login date
    await structureCommonRepository.updateOne(
      { id: authUser.structureId },
      { lastLogin: new Date() }
    );

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
    payload: Pick<UserStructureJwtPayload, "_userId" | "_userProfile">
  ): Promise<UserStructureAuthenticated> {
    const user = await userStructureRepository.findOne<UserStructurePublic>(
      { id: payload._userId },
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
      _userId: payload._userId,
      _userProfile: payload._userProfile,
      ...user,
      structure,
    };
  }
}
