import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { domifaConfig } from "../../config";
import {
  CURRENT_JWT_PAYLOAD_VERSION,
  UserAdminAuthenticated,
  UserSupervisorJwtPayload,
  UserStructureAuthenticated,
  UserStructureJwtPayload,
  UserUsagerAuthenticated,
  UserUsagerJwtPayload,
} from "../../_common/model";
import { UsagersAuthService } from "../../modules/portail-usagers/services";
import { StructuresAuthService } from "../services/structures-auth.service";
import { AdminsAuthService } from "../../modules/portail-admin/services/admins-auth.service";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly structureAuthService: StructuresAuthService,
    private readonly usagersAuthService: UsagersAuthService,
    private readonly adminsAuthService: AdminsAuthService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: domifaConfig().security.jwtSecret,
    });
  }

  public async validate(
    payload:
      | UserStructureJwtPayload
      | UserUsagerJwtPayload
      | UserSupervisorJwtPayload
  ): Promise<
    | false
    | UserUsagerAuthenticated
    | UserStructureAuthenticated
    | UserAdminAuthenticated
  > {
    if (CURRENT_JWT_PAYLOAD_VERSION !== payload?._jwtPayloadVersion) {
      // revoke old payloads (= force to logout)
      return false;
    }

    if (payload?._userProfile === "supervisor") {
      return await this.adminsAuthService.validateUserAdmin(
        payload as UserSupervisorJwtPayload
      );
    } else if (payload?._userProfile === "structure") {
      return await this.structureAuthService.validateUserStructure(
        payload as UserStructureJwtPayload
      );
    } else if (payload?._userProfile === "usager") {
      return await this.usagersAuthService.validateUserUsager(
        payload as UserUsagerJwtPayload
      );
    }
    return false;
  }
}
