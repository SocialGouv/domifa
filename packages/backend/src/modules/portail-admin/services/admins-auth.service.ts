import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { userStructureRepository } from "../../../database";

import {
  CURRENT_JWT_PAYLOAD_VERSION,
  UserAdminAuthenticated,
  UserAdminJwtPayload,
} from "../../../_common/model";
import { portailAdminProfilBuilder } from "./portail-admin-profil-builder.service";
import { CommonUser, PortailAdminUser } from "@domifa/common";

@Injectable()
export class AdminsAuthService {
  constructor(private readonly jwtService: JwtService) {}

  public login(user: CommonUser) {
    const payload: UserAdminJwtPayload = {
      _jwtPayloadVersion: CURRENT_JWT_PAYLOAD_VERSION,
      _userId: user.id,
      _userProfile: "supervisor",
      userId: user.id,
      lastLogin: user.lastLogin,
    };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  public async validateUserAdmin(
    payload: UserAdminJwtPayload
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
    payload: Pick<UserAdminJwtPayload, "_userId">
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
