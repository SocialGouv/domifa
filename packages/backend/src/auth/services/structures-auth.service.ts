import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { differenceInCalendarDays } from "date-fns";
import { domifaConfig } from "../../config";
import { userStructureRepository, structureRepository } from "../../database";
import {
  CURRENT_JWT_PAYLOAD_VERSION,
  UserStructureAuthenticated,
  UserStructureJwtPayload,
  UserStructurePublic,
} from "../../_common/model";
import { isDomifaAdmin } from "./auth-checker.service";
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
  "lastLogin",
  "createdAt",
];

@Injectable()
export class StructuresAuthService {
  constructor(private readonly jwtService: JwtService) {}

  public login(user: UserStructure) {
    const isSuperAdminDomifa = isDomifaAdmin(user);

    const payload: UserStructureJwtPayload = {
      _jwtPayloadVersion: CURRENT_JWT_PAYLOAD_VERSION,
      _userId: user.id,
      _userProfile: "structure",
      email: user.email,
      id: user.id,
      lastLogin: user.lastLogin,
      nom: user.nom,
      prenom: user.prenom,
      role: user.role,
      acceptTerms: user.acceptTerms,
      structureId: user.structureId,
      isSuperAdminDomifa,
      userRightStatus: isSuperAdminDomifa ? "super-admin-domifa" : "structure",
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

    // Mise à jour une seule fois par jour
    const authStructureLastLogin = authUser.structure.lastLogin
      ? new Date(authUser.structure.lastLogin)
      : new Date(authUser.structure.createdAt);

    if (differenceInCalendarDays(authStructureLastLogin, new Date()) < 0) {
      // update structure & user last login date
      await structureRepository.update(
        { id: authUser.structureId },
        { lastLogin: new Date() }
      );
    }

    const authUserLastLogin = authUser.lastLogin
      ? new Date(authUser.lastLogin)
      : new Date(authUser.createdAt);

    // Mise à jour une seule fois par jour
    if (differenceInCalendarDays(authUserLastLogin, new Date()) < 0) {
      await userStructureRepository.update(
        { id: authUser.id, structureId: authUser.structureId },
        { lastLogin: new Date() }
      );
    }

    return authUser;
  }
  public async findAuthUser(
    payload: Pick<
      UserStructureJwtPayload,
      "_userId" | "_userProfile" | "isSuperAdminDomifa"
    >
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
      ],
    });

    return {
      _userId: payload._userId,
      _userProfile: payload._userProfile,
      ...user,
      structure,
      isSuperAdminDomifa: payload.isSuperAdminDomifa,
    };
  }
}
