import { MigrationInterface } from "typeorm";
import {
  userStructureRepository,
  userSupervisorRepository,
  userSupervisorSecurityRepository,
} from "../database";
import { UserStructureRole } from "@domifa/common";
import { domifaConfig } from "../config";
import { UserSupervisorSecurityTable } from "../database/entities/user-supervisor";

export class ManualMigration1743546596814 implements MigrationInterface {
  public async up(): Promise<void> {
    if (
      domifaConfig().envId === "prod" ||
      domifaConfig().envId === "preprod" ||
      domifaConfig().envId === "local"
    ) {
      await userSupervisorSecurityRepository.delete({});
      await userSupervisorRepository.delete({});

      const users = await userStructureRepository.findBy({
        role: "admin" as UserStructureRole,
        structureId: 1,
      });

      for (const user of users) {
        await userSupervisorRepository.save({
          ...user,
          role: "super-admin-domifa",
          territories: [],
        });

        const updatedUser = await userSupervisorRepository.findOneBy({
          email: user.email,
        });

        await userSupervisorSecurityRepository.save(
          new UserSupervisorSecurityTable({
            userId: updatedUser.id,
            eventsHistory: [],
            temporaryTokens: null,
          })
        );
      }
    }
  }

  public async down(): Promise<void> {}
}
