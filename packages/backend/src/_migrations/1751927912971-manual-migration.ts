import { IsNull, MigrationInterface, Not } from "typeorm";
import { domifaConfig } from "../config";
import { matchFonctionUtilisateur } from "@domifa/common/src/structure/functions/matchFonctionUtilisateur";
import { userStructureRepository } from "../database";
import { UserFonction } from "@domifa/common";

export class ManualMigration1751927912971 implements MigrationInterface {
  name = "ManualMigration1751927912971";

  public async up(): Promise<void> {
    const stats = [];
    if (
      domifaConfig().envId === "prod" ||
      domifaConfig().envId === "preprod" ||
      domifaConfig().envId === "local"
    ) {
      console.log("Application de la migration");

      const users = await userStructureRepository.find({
        where: {
          fonction: Not(IsNull()),
        },
        select: {
          id: true,
          fonction: true,
          fonctionDetail: true,
        },
      });

      // Process each user record
      for (const user of users) {
        const currentFonction = user.fonction;
        const fonction = matchFonctionUtilisateur(currentFonction);
        await userStructureRepository.update(
          {
            id: user.id,
          },
          {
            fonction,
            fonctionDetail:
              currentFonction === UserFonction.AUTRE ? user.fonction : null,
          }
        );

        stats.push({
          userId: user.id,
          oldFonction: currentFonction,
          newFonction: fonction,
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
