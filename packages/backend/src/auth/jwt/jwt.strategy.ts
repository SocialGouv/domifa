import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Request } from "express";
import { ExtractJwt, Strategy } from "passport-jwt";

import { domifaConfig } from "../../config";

const SKIP_FINGERPRINT_CHECK = domifaConfig().envId === "test";
import {
  getClientIp,
  getClientUserAgent,
} from "../../util/express/clientRequest.helper";
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
import { SessionFingerprintService } from "../services/session-fingerprint.service";
import { StructuresAuthService } from "../services/structures-auth.service";
import { AdminsAuthService } from "../../modules/portail-admin/services/admins-auth.service";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly structureAuthService: StructuresAuthService,
    private readonly usagersAuthService: UsagersAuthService,
    private readonly adminsAuthService: AdminsAuthService,
    private readonly sessionFingerprintService: SessionFingerprintService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: domifaConfig().security.jwtSecret,
      passReqToCallback: true,
    });
  }

  public async validate(
    req: Request,
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
      return false;
    }

    if (payload?._userProfile === "supervisor") {
      const supervisorPayload = payload as UserSupervisorJwtPayload;
      if (!supervisorPayload.fingerprintHash) {
        return false;
      }
      const authUser = await this.adminsAuthService.validateUserAdmin(
        supervisorPayload
      );

      if (authUser && !SKIP_FINGERPRINT_CHECK) {
        const ok = await this.sessionFingerprintService.verifySessionFromJwt(
          "supervisor",
          authUser.id,
          authUser.uuid,
          supervisorPayload.fingerprintHash,
          getClientIp(req),
          getClientUserAgent(req)
        );
        if (!ok) {
          return false;
        }
      }

      return authUser;
    } else if (payload?._userProfile === "structure") {
      const structurePayload = payload as UserStructureJwtPayload;
      if (!structurePayload.fingerprintHash) {
        return false;
      }
      const authUser = await this.structureAuthService.validateUserStructure(
        structurePayload
      );

      if (authUser && !SKIP_FINGERPRINT_CHECK) {
        const ok = await this.sessionFingerprintService.verifySessionFromJwt(
          "structure",
          authUser.id,
          authUser.uuid,
          structurePayload.fingerprintHash,
          getClientIp(req),
          getClientUserAgent(req)
        );
        if (!ok) {
          return false;
        }
      }

      return authUser;
    } else if (payload?._userProfile === "usager") {
      return await this.usagersAuthService.validateUserUsager(
        payload as UserUsagerJwtPayload
      );
    }
    return false;
  }
}
