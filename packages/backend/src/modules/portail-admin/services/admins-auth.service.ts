import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { userStructureRepository } from "../../../database";

import {
  CURRENT_JWT_PAYLOAD_VERSION,
  UserAdminAuthenticated,
  UserSupervisorJwtPayload,
} from "../../../_common/model";
import { portailAdminProfilBuilder } from "./portail-admin-profil-builder.service";
import {
  PortailAdminAuthApiResponse,
  PortailAdminUser,
  UserSupervisor,
} from "@domifa/common";

@Injectable()
export class AdminsAuthService {
  constructor(private readonly jwtService: JwtService) {}

  public login(user: UserSupervisor) {
    const payload: UserSupervisorJwtPayload = {
      _jwtPayloadVersion: CURRENT_JWT_PAYLOAD_VERSION,
      _userId: user.id,
      _userProfile: "supervisor",
      lastLogin: user.lastLogin,
      id: user.id,
      userId: user.id,
    };

    const response: PortailAdminAuthApiResponse = {
      token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        nom: user.nom,
        role: user.role,
        prenom: user.prenom,
        verified: user.verified,
        lastLogin: user.lastLogin,
      },
    };
    return response;
  }

  public async validateUserAdmin(
    payload: UserSupervisorJwtPayload
  ): Promise<false | UserAdminAuthenticated> {
    if (payload._userProfile !== "supervisor") {
      return false;
    }
    const authUser = await this.findAuthUserAdmin(payload);

    if (!authUser) {
      return false;
    }

    // update structure & user last login date
    await userStructureRepository.update(
      { id: authUser.id },
      { lastLogin: new Date() }
    );

    return authUser;
  }

  public async findAuthUserAdmin(
    payload: Pick<UserSupervisorJwtPayload, "_userId">
  ): Promise<UserAdminAuthenticated> {
    const user: PortailAdminUser = await portailAdminProfilBuilder.build({
      userId: payload._userId,
    });

    const auth: UserAdminAuthenticated = {
      _userId: payload._userId,
      _userProfile: "supervisor",
      ...user,
    };

    return auth;
  }
}
