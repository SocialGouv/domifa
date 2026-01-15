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

    // Structure
    const structureLastLogin = authUser.structure.lastLogin
      ? new Date(authUser.structure.lastLogin)
      : new Date(authUser.structure.createdAt);

    const structureInactivityDays = differenceInCalendarDays(
      today,
      structureLastLogin
    );
    if (structureInactivityDays > 0) {
      // Vérifier si c'est une réactivation (lastLogin était nul ou > 12 mois)
      const isStructureReactivation =
        !authUser.structure.lastLogin || structureInactivityDays > 365;

      if (isStructureReactivation) {
        appLogger.info(
          `Réactivation de structure - structureId: ${authUser.structureId}`
        );

        await appLogsRepository.save({
          structureId: authUser.structureId,
          userId: authUser.id,
          usagerRef: null,
          action: "REACTIVATION_STRUCTURE",
        });
      }

      await structureRepository.update(
        { id: authUser.structureId },
        { lastLogin: today }
      );
    }

    // User
    const userLastLogin = authUser.lastLogin
      ? new Date(authUser.lastLogin)
      : new Date(authUser.createdAt);

    const userInactivityDays = differenceInCalendarDays(today, userLastLogin);
    if (userInactivityDays > 0) {
      // Vérifier si c'est une réactivation (lastLogin était nul ou > 12 mois)
      const isUserReactivation =
        !authUser.lastLogin || userInactivityDays > 365;

      if (isUserReactivation) {
        appLogger.info(
          `Réactivation de compte utilisateur - userId: ${authUser.id}, structureId: ${authUser.structureId}`
        );

        await appLogsRepository.save({
          structureId: authUser.structureId,
          userId: authUser.id,
          usagerRef: null,
          action: "REACTIVATION_ACCOUNT",
        });
      }

      await userStructureRepository.update(
        { id: authUser.id, structureId: authUser.structureId },
        { lastLogin: today }
      );
    }

    return authUser;
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
