import { Injectable } from "@nestjs/common";
import {
  CURRENT_JWT_PAYLOAD_VERSION,
  UserUsagerJwtPayload,
} from "../../../auth/jwt";
import { AuthJwtService } from "../../../auth/services/auth-jwt-service";
import {
  structureRepository,
  usagerRepository,
  userUsagerRepository,
} from "../../../database";
import { appLogger } from "../../../util";
import { UserUsager, UserUsagerAuthenticated } from "../../../_common/model";

@Injectable()
export class UsagersAuthService {
  constructor(private readonly authJwtService: AuthJwtService) {}

  public async login(user: UserUsager) {
    const payload: UserUsagerJwtPayload = {
      _jwtPayloadVersion: CURRENT_JWT_PAYLOAD_VERSION,
      _userId: user.id,
      _userProfile: "usager",
      userId: user.id,
      usagerUUID: user.usagerUUID,
      structureId: user.structureId,
      lastLogin: user.lastLogin,
    };
    return {
      access_token: this.authJwtService.sign(payload),
    };
  }

  public async validateUser(
    payload: UserUsagerJwtPayload
  ): Promise<false | UserUsagerAuthenticated> {
    const authUser = await this.findAuthUser(payload);

    if (!authUser || authUser === null) {
      return false;
    }

    // update usager user last login date
    await userUsagerRepository.updateOne(
      { id: authUser.user.id },
      { lastLogin: new Date() }
    );

    return authUser;
  }

  public async findAuthUser(
    payload: Pick<UserUsagerJwtPayload, "_userId">
  ): Promise<UserUsagerAuthenticated> {
    const user = await userUsagerRepository.findOne({ id: payload._userId });

    const usager = await usagerRepository.findOne({ uuid: user.usagerUUID });

    if (typeof user.structureId === "undefined") {
      appLogger.debug("[TRACK BUG] " + JSON.stringify(user));
    }

    const structure = await structureRepository.findOne({
      id: user.structureId,
    });

    const auth: UserUsagerAuthenticated = {
      _userId: payload._userId,
      _userProfile: "usager",
      structure,
      user,
      usager,
    };

    return auth;
  }
}
