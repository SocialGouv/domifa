import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { userStructureRepository } from "../../../database";

import {
  CURRENT_JWT_PAYLOAD_VERSION,
  PortailAdminProfile,
  PortailAdminUser,
  UserAdminAuthenticated,
  UserAdminJwtPayload,
} from "../../../_common/model";
import { portailAdminProfilBuilder } from "../../portail-admin-profil/services/portail-admin-profil-builder.service";

@Injectable()
export class AdminsAuthService {
  constructor(private readonly jwtService: JwtService) {}

  public async login(user: PortailAdminUser) {
    const payload: UserAdminJwtPayload = {
      _jwtPayloadVersion: CURRENT_JWT_PAYLOAD_VERSION,
      _userId: user.id,
      _userProfile: "super-admin-domifa",
      userId: user.id,
      lastLogin: user.lastLogin,
      isSuperAdminDomifa: true,
      userRightStatus: user?.userRightStatus,
      territories: user?.territories ?? [],
    };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  public async validateUserAdmin(
    payload: UserAdminJwtPayload
  ): Promise<false | UserAdminAuthenticated> {
    if (payload._userProfile !== "super-admin-domifa") {
      return false;
    }
    const authUser = await this.findAuthUserAdmin(payload);

    if (!authUser) {
      return false;
    }

    // update structure & user last login date
    await userStructureRepository.update(
      { id: authUser.user.id },
      { lastLogin: new Date() }
    );

    return authUser;
  }

  public async findAuthUserAdmin(
    payload: Pick<UserAdminJwtPayload, "_userId">
  ): Promise<UserAdminAuthenticated> {
    const userProfile: PortailAdminProfile =
      await portailAdminProfilBuilder.build({
        userId: payload._userId,
      });

    const auth: UserAdminAuthenticated = {
      _userId: payload._userId,
      _userProfile: "super-admin-domifa",
      user: userProfile.user,
      isSuperAdminDomifa: true,
    };

    return auth;
  }
}
