import { Injectable } from "@nestjs/common";

import {
  userStructureRepository,
  userStructureSecurityRepository,
  structureRepository,
} from "../../../database";
import { UsersForAdminList } from "../types";
import { StructureAdmin } from "@domifa/common";

@Injectable()
export class AdminStructuresService {
  public async unblockStructureUser(
    userId: number,
    structureId: number
  ): Promise<void> {
    await userStructureRepository.update(
      { id: userId, structureId },
      { status: "ACTIVE" }
    );
    // Reset recent error history so the throttler does not immediately
    // re-block the account.
    await userStructureSecurityRepository.update(
      { userId },
      { eventsHistory: [] }
    );
  }

  public async getAdminStructuresListData(): Promise<StructureAdmin[]> {
    return await structureRepository
      .createQueryBuilder("structure")
      .select([
        "structure.*",
        `(SELECT COUNT(DISTINCT u.uuid) FROM usager u WHERE u."structureId" = structure.id) as usagers`,
        `(SELECT COUNT(DISTINCT us.uuid) FROM user_structure us WHERE us."structureId" = structure.id) as users`,
        `(SELECT COUNT(DISTINCT u.uuid) FROM usager u WHERE u."structureId" = structure.id AND u.statut = 'VALIDE') as actifs`,
      ])
      .orderBy("structure.createdAt", "DESC")
      .getRawMany();
  }

  public async getUsersForAdmin(): Promise<UsersForAdminList[]> {
    return await userStructureRepository
      .createQueryBuilder("user_structure")
      .leftJoin(
        "structure",
        "structure",
        `user_structure."structureId" = structure.id`
      )
      .select([
        "user_structure.id AS id",
        "user_structure.email AS email",
        "user_structure.nom AS nom",
        "prenom",
        "role",
        "user_structure.status as status",
        `"structureId"`,
        `structure.nom AS "structureName"`,
      ])
      .getRawMany();
  }
}
