import { userSupervisorRepository } from "../database";
import { domifaConfig } from "../config";
import { IsNull, MigrationInterface, Not } from "typeorm";
import { matchFonctionUtilisateur } from "@domifa/common/src/structure/functions/matchFonctionUtilisateur";

export class ManualMigration1751975605264 implements MigrationInterface {
  public async up(): Promise<void> {
    const stats = [];
    if (
      domifaConfig().envId === "prod" ||
      domifaConfig().envId === "preprod" ||
      domifaConfig().envId === "local"
    ) {
      console.log("Application de la migration pour la table user_supervisor");

      const users = await userSupervisorRepository.find({
        where: {
          fonction: Not(IsNull()),
        },
        select: {
          id: true,
          fonction: true,
        },
      });

      for (const user of users) {
        const currentFonction = user.fonction;
        const matchedFonction = matchFonctionUtilisateur(currentFonction);
        await userSupervisorRepository.update(
          {
            id: user.id,
          },
          {
            fonction: matchedFonction,
          }
        );

        stats.push({
          userId: user.id,
          oldFonction: currentFonction,
          newFonction: matchedFonction,
        });
      }

      console.table(stats);
    }
  }

  public async down(): Promise<void> {
    if (
      domifaConfig().envId === "prod" ||
      domifaConfig().envId === "preprod" ||
      domifaConfig().envId === "local"
    ) {
      console.log(
        "La récupération des données est impossible vu que la fonction est désormais fortement typée"
      );
    }
  }
}
