import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { differenceInCalendarDays } from "date-fns";
import { domifaConfig } from "../../config";
import {
  userStructureRepository,
  structureRepository,
  appLogsRepository,
} from "../../database";
import { appLogger } from "../../util";
import {
  CURRENT_JWT_PAYLOAD_VERSION,
  UserStructureAuthenticated,
  UserStructureJwtPayload,
  UserStructurePublic,
} from "../../_common/model";

import { UserStructure, StructureCommon } from "@domifa/common";
import { LogAction } from "../../modules/app-logs/types";

export const APP_USER_PUBLIC_ATTRIBUTES: (keyof UserStructurePublic)[] = [
  "uuid",
  "id",
  "prenom",
  "nom",
  "email",
  "verified",
  "structureId",
  "lastLogin",
  "acceptTerms",
  "role",
  "fonction",
  "fonctionDetail",
  "createdAt",
];

type ReactivationType = "STRUCTURE" | "ACCOUNT";

interface ReactivationEvent {
  type: ReactivationType;
  userId: number;
  structureId: number;
  inactivityDays: number;
  lastLoginBefore: Date | null;
}

@Injectable()
export class StructuresAuthService {
  constructor(private readonly jwtService: JwtService) {}

  public login(user: UserStructure) {
    const payload: UserStructureJwtPayload = {
      _jwtPayloadVersion: CURRENT_JWT_PAYLOAD_VERSION,
      _userId: user.id,
      _userProfile: "structure",
      email: user.email,
      id: user.id,
      userId: user.id,
      lastLogin: user.lastLogin,
      nom: user.nom,
      prenom: user.prenom,
      fonction: user.fonction,
      fonctionDetail: user.fonctionDetail,
      role: user.role,
      acceptTerms: user.acceptTerms,
      structureId: user.structureId,
      domifaVersion: domifaConfig().version.toString(),
    };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  public async validateUserStructure(
    payload: UserStructureJwtPayload
  ): Promise<false | UserStructureAuthenticated> {
    if (payload._userProfile !== "structure") {
      return false;
    }

    const authUser = await this.findAuthUser(payload);
    if (!authUser) {
      return false;
    }

    const today = new Date();

    await this.handleReactivationCheck(
      authUser,
      "STRUCTURE",
      authUser.structure.lastLogin,
      authUser.structure.createdAt,
      today
    );

    await this.handleReactivationCheck(
      authUser,
      "ACCOUNT",
      authUser.lastLogin,
      authUser.createdAt,
      today
    );

    return authUser;
  }

  private async handleReactivationCheck(
    authUser: UserStructureAuthenticated,
    type: ReactivationType,
    lastLogin: Date | null,
    createdAt: Date,
    today: Date
  ): Promise<void> {
    const referenceDate = lastLogin ? new Date(lastLogin) : new Date(createdAt);
    const inactivityDays = differenceInCalendarDays(today, referenceDate);

    if (inactivityDays <= 0) {
      return;
    }

    const isReactivation = !lastLogin || inactivityDays > 365;

    if (isReactivation) {
      const event: ReactivationEvent = {
        type,
        userId: authUser.id,
        structureId: authUser.structureId,
        inactivityDays,
        lastLoginBefore: lastLogin,
      };

      await this.logReactivation(event);
    }

    await this.updateLastLogin(type, authUser, today);
  }

  private async logReactivation(event: ReactivationEvent): Promise<void> {
    const actionMap: Record<ReactivationType, string> = {
      STRUCTURE: "REACTIVATION_STRUCTURE",
      ACCOUNT: "REACTIVATION_ACCOUNT",
    };

    const action = actionMap[event.type];

    const context = {
      lastLoginBefore: event.lastLoginBefore,
      daysOfInactivity: event.inactivityDays,
    };

    appLogger.info(
      `Réactivation de ${
        event.type === "STRUCTURE" ? "structure" : "compte utilisateur"
      } - ` +
        `userId: ${event.userId}, structureId: ${event.structureId}, ` +
        `inactivité: ${event.inactivityDays} jours`
    );

    await appLogsRepository.save({
      structureId: event.structureId,
      userId: event.userId,
      usagerRef: null,
      action: action as LogAction,
      context,
    });
  }

  private async updateLastLogin(
    type: ReactivationType,
    authUser: UserStructureAuthenticated,
    today: Date
  ): Promise<void> {
    if (type === "STRUCTURE") {
      await structureRepository.update(
        { id: authUser.structureId },
        { lastLogin: today }
      );
    } else {
      await userStructureRepository.update(
        { id: authUser.id, structureId: authUser.structureId },
        { lastLogin: today }
      );
    }
  }

  public async findAuthUser(
    payload: Pick<UserStructureJwtPayload, "_userId" | "_userProfile">
  ): Promise<UserStructureAuthenticated> {
    const user = await userStructureRepository.findOne({
      where: { id: payload._userId },
      select: APP_USER_PUBLIC_ATTRIBUTES,
    });

    const structure: StructureCommon = await structureRepository.findOne({
      where: { id: user.structureId },
      select: [
        "uuid",
        "updatedAt",
        "id",
        "adresse",
        "adresseCourrier",
        "agrement",
        "capacite",
        "codePostal",
        "complementAdresse",
        "departement",
        "region",
        "email",
        "nom",
        "options",
        "telephone",
        "responsable",
        "structureType",
        "ville",
        "lastLogin",
        "organismeType",
        "createdAt",
        "sms",
        "portailUsager",
        "acceptTerms",
        "timeZone",
        "reseau",
        "registrationData",
        "siret",
      ],
    });

    return {
      _userId: payload._userId,
      _userProfile: payload._userProfile,
      ...user,
      structure,
    };
  }
}
