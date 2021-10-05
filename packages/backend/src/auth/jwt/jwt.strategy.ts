import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { UserStructureJwtPayload } from ".";
import { domifaConfig } from "../../config";
import {
  structureRepository,
  usagerRepository,
  userUsagerRepository,
} from "../../database";
import { appLogger } from "../../util";
import {
  UserStructureAuthenticated,
  UserUsagerAuthenticated,
} from "../../_common/model";
import { StructuresAuthService } from "../services/structures-auth.service";
import { CURRENT_JWT_PAYLOAD_VERSION } from "./CURRENT_JWT_PAYLOAD_VERSION.const";
import { UserUsagerJwtPayload } from "./user-usager-jwt-payload.interface";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly structureAuthService: StructuresAuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: domifaConfig().security.jwtSecret,
    });
  }
  public async validate(
    payload: UserStructureJwtPayload | UserUsagerJwtPayload
  ): Promise<false | UserUsagerAuthenticated | UserStructureAuthenticated> {
    if (CURRENT_JWT_PAYLOAD_VERSION !== payload?._jwtPayloadVersion) {
      // revoke old payloads (= force to logout)
      return false;
    }
    if (
      payload?._userProfile === "structure" ||
      payload?._userProfile === "super-admin-domifa"
    ) {
      return this.structureAuthService.validateUser(
        payload as UserStructureJwtPayload
      );
    } else if (payload?._userProfile === "usager") {
      return this.validateUserUsager(payload as UserUsagerJwtPayload);
    }
    return false;
  }

  public async validateUserUsager(
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
