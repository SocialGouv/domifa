import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { structureRepository } from "../../../database";

import { usagerRepository } from "../../../database/services/usager/usagerRepository.service";
import { userUsagerRepository } from "../../../database/services/user-usager/userUsagerRepository.service";
import { appLogger } from "../../../util";
import {
  CURRENT_JWT_PAYLOAD_VERSION,
  UserUsager,
  UserUsagerAuthenticated,
  UserUsagerJwtPayload,
} from "../../../_common/model";

@Injectable()
export class UsagersAuthService {
  constructor(private readonly jwtService: JwtService) {}

  public async login(user: UserUsager) {
    const payload: UserUsagerJwtPayload = {
      _jwtPayloadVersion: CURRENT_JWT_PAYLOAD_VERSION,
      _userId: user.id,
      _userProfile: "usager",
      userId: user.id,
      usagerUUID: user.usagerUUID,
      structureId: user.structureId,
      lastLogin: user.lastLogin,
      isSuperAdminDomifa: false,
      userRightStatus: "structure",
    };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  public async validateUserUsager(
    payload: UserUsagerJwtPayload
  ): Promise<false | UserUsagerAuthenticated> {
    if (payload._userProfile !== "usager") {
      return false;
    }
    const authUser = await this.findAuthUserUsager(payload);

    if (!authUser) {
      return false;
    }

    // update usager user last login date
    await userUsagerRepository.update(
      { id: authUser.user.id },
      { lastLogin: new Date() }
    );

    return authUser;
  }

  public async findAuthUserUsager(
    payload: Pick<UserUsagerJwtPayload, "_userId">
  ): Promise<UserUsagerAuthenticated> {
    const user = await userUsagerRepository.findOneBy({ id: payload._userId });

    const usager = await usagerRepository.findOneBy({ uuid: user.usagerUUID });

    if (typeof user.structureId === "undefined") {
      appLogger.debug("[TRACK BUG] " + JSON.stringify(user));
    }

    const structure = await structureRepository.findOneBy({
      id: user.structureId,
    });

    const auth: UserUsagerAuthenticated = {
      _userId: payload._userId,
      _userProfile: "usager",
      structure,
      user,
      usager,
      isSuperAdminDomifa: false,
    };

    return auth;
  }
}
