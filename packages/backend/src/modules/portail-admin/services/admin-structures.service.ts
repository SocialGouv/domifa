import { Injectable } from "@nestjs/common";

import {
  userStructureRepository,
  userStructureSecurityRepository,
  structureRepository,
} from "../../../database";
import { UsersForAdminList } from "../types";
import { StructureAdmin } from "@domifa/common";
import { userSecurityEventHistoryManager } from "../../users/services";
import { UserSecurityEvent } from "../../../_common/model/users/user-security/UserSecurityEvent.interface";

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

  public async blockStructureUser(
    userId: number,
    structureId: number
  ): Promise<void> {
    await userStructureRepository.update(
      { id: userId, structureId },
      { status: "BLOCKED" }
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
    const users = await userStructureRepository
      .createQueryBuilder("user_structure")
      .leftJoin(
        "structure",
        "structure",
        `user_structure."structureId" = structure.id`
      )
      .leftJoin(
        "user_structure_security",
        "uss",
        `uss."userId" = user_structure.id`
      )
      .select([
        "user_structure.id AS id",
        "user_structure.uuid AS uuid",
        "user_structure.email AS email",
        "user_structure.nom AS nom",
        "prenom",
        "role",
        "user_structure.status as status",
        `user_structure."structureId" AS "structureId"`,
        `user_structure."lastLogin" AS "lastLogin"`,
        `user_structure."passwordLastUpdate" AS "passwordLastUpdate"`,
        `user_structure."createdAt" AS "createdAt"`,
        `structure.nom AS "structureName"`,
        `uss."eventsHistory" AS "eventsHistory"`,
        `uss."temporaryTokens" AS "temporaryTokens"`,
      ])
      .orderBy("user_structure.nom", "ASC")
      .getRawMany<UsersForAdminList>();

    return users.map((user) => ({
      ...user,
      eventsHistory: user.eventsHistory ?? [],
      remainingBackoffMinutes:
        userSecurityEventHistoryManager.getBackoffTime(
          (user.eventsHistory ?? []) as UserSecurityEvent[]
        ) ?? null,
    }));
  }
}
