import { PortailAdminUser } from "@domifa/common";
import { Not } from "typeorm";

import { UserSupervisorTable } from "../../entities/user-supervisor";
import { myDataSource } from "../_postgres";

export const userSupervisorRepository = myDataSource
  .getRepository(UserSupervisorTable)
  .extend({
    // Projection used by the portail-admin `/me` and login flows: returns the
    // public profile shape consumed by the front-end. Throws if the user no
    // longer exists (deleted between JWT issuance and the call) or if its
    // status is "DELETE" (soft-deleted account).
    async getAdminProfile(userId: number): Promise<PortailAdminUser> {
      return userSupervisorRepository.findOneOrFail({
        where: { id: userId, status: Not("DELETE") },
        select: [
          "uuid",
          "createdAt",
          "updatedAt",
          "version",
          "id",
          "prenom",
          "nom",
          "email",
          "role",
          "territories",
        ],
      });
    },
  });
