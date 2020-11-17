import { Inject, Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Model } from "mongoose";
import { StructuresService } from "../structures/services/structures.service";
import { Structure } from "../structures/structure-interface";
import { usersRepository } from "../users/pg/users-repository.service";
import {
  AppAuthUser,
  AppUser,
  AppUserPublic,
  StructurePublic
} from "../_common/model";
import { JwtPayload } from "./jwt-payload.interface";

export const APP_USER_PUBLIC_ATTRIBUTES: (keyof AppUserPublic)[] = [
  "id",
  "prenom",
  "nom",
  "email",
  "verified",
  "structureId",
  "fonction",
  "role",
];
export const STRUCTURE_PUBLIC_ATTRIBUTES: (keyof StructurePublic)[] = [
  "id",
  "adresse",
  "complementAdresse",
  "nom",
  "structureType",
  "ville",
  "departement",
  "region",
  "capacite",
  "codePostal",
  "agrement",
  "phone",
  "email",
  "responsable",
  "options",
  "adresseCourrier",
];

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly structuresService: StructuresService,
    @Inject("STRUCTURE_MODEL") private structureModel: Model<Structure>
  ) {}

  public async login(user: AppUser) {
    const payload = {
      email: user.email,
      id: user.id,
      lastLogin: user.lastLogin,
      nom: user.nom,
      prenom: user.prenom,
      role: user.role,
      structure: user.structure,
    };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  public async validateUser(payload: JwtPayload): Promise<false | AppAuthUser> {
    const user = await usersRepository.findOne<AppUserPublic>(
      { id: payload.id },
      {
        select: APP_USER_PUBLIC_ATTRIBUTES,
      }
    );

    const structure: StructurePublic = await this.structureModel
      .findOne({
        id: user.structureId,
      })
      .select(STRUCTURE_PUBLIC_ATTRIBUTES)
      .lean();

    if (!user || user === null) {
      return false;
    }

    // update structure & user last login date
    await this.structuresService.updateLastLogin(user.structureId);
    await usersRepository.updateOne(
      {
        id: user.id,
        structureId: user.structureId,
      },
      {
        lastLogin: new Date(),
      }
    );

    return {
      ...user,
      structure,
    };
  }
}
