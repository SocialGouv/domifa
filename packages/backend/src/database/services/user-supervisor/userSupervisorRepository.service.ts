import { PortailAdminUser } from "@domifa/common";

import { UserSupervisorTable } from "../../entities/user-supervisor";
import { myDataSource } from "../_postgres";

export const userSupervisorRepository = myDataSource
  .getRepository(UserSupervisorTable)
  .extend({
    // Projection used by the portail-admin `/me` and login flows: returns the
    // public profile shape consumed by the front-end. Throws if the user no
    // longer exists (deleted between JWT issuance and the call).
    async getAdminProfile(userId: number): Promise<PortailAdminUser> {
      return userSupervisorRepository.findOneOrFail({
        where: { id: userId },
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
