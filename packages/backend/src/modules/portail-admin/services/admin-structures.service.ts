import { Injectable } from "@nestjs/common";

import {
  userStructureRepository,
  structureRepository,
} from "../../../database";
import { StructureAdminForList, UsersForAdminList } from "../types";

@Injectable()
export class AdminStructuresService {
  public async getAdminStructuresListData(): Promise<StructureAdminForList[]> {
    return await structureRepository
      .createQueryBuilder("structure")
      .select("structure.*")
      .leftJoin("usager", "usager", `usager."structureId" = structure.id`)
      .leftJoin(
        "user_structure",
        "user_structure",
        `user_structure."structureId" = structure.id`
      )
      .addSelect("COUNT(DISTINCT usager.uuid)", "usagers")
      .addSelect("COUNT(DISTINCT user_structure.uuid)", "users")
      .groupBy("structure.uuid")
      .orderBy(`structure."createdAt"`, "DESC")
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
        "user_structure.verified as verified",
        `"structureId"`,
        `structure.nom AS "structureName"`,
      ])
      .getRawMany();
  }
}
