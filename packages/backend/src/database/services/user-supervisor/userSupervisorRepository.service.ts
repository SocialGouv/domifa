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
      const user = await userSupervisorRepository.findOneOrFail({
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
          "status",
          "lastLogin",
          "territories",
          "passwordLastUpdate",
        ],
      });

      return {
        id: user.id,
        uuid: user.uuid,
        nom: user.nom,
        prenom: user.prenom,
        email: user.email,
        status: user.status,
        lastLogin: user.lastLogin,
        territories: user.territories,
        role: user.role,
        passwordLastUpdate: user.passwordLastUpdate,
        createdAt: user.createdAt,
      };
    },
  });
