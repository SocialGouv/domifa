/* eslint-disable @typescript-eslint/no-unused-vars */
import { interactionRepository } from "../database/services/interaction/interactionRepository.service";
import { In, MigrationInterface, QueryRunner } from "typeorm";
import { InteractionsTable, myDataSource, usagerRepository } from "../database";
import { TOULOUSE_STRUCTURE_ID, getDateFromXml } from "../_common/tmp-toulouse";
import { tmpHistoriqueRepository } from "../database/services/interaction/historiqueRepository.service";
import { format } from "date-fns";

export class ManualMigration1697659880952 implements MigrationInterface {
  public async up(): Promise<void> {
    const queryRunner = myDataSource.createQueryRunner();

    console.log("");
    console.log("Lancement de la migration d'import des passages 🏃‍♂️");
    console.log("");

    console.log("Réinitialisation des variables de migration");
    await usagerRepository.update({}, { migrated: true });
    await usagerRepository.update(
      { structureId: TOULOUSE_STRUCTURE_ID },
      { migrated: false }
    );

    console.log("Suppression des précédents passages");
    await interactionRepository.delete({
      structureId: TOULOUSE_STRUCTURE_ID,
      type: "visite",
    });

    const total = await usagerRepository.countMigratedUsagers();
    console.log(total + " usagers à migrer");
    let cpt = 0;

    while ((await usagerRepository.countMigratedUsagers()) > 0) {
      let usagerIdsToUpdate = [];
      const usagers = await usagerRepository.find({
        where: { structureId: TOULOUSE_STRUCTURE_ID, migrated: false },
        take: 500,
        select: ["ref", "uuid", "nom"],
      });

      await queryRunner.startTransaction();
      for (const usager of usagers) {
        cpt++;
        usagerIdsToUpdate.push(usager.uuid);
        const interactions = await tmpHistoriqueRepository.find({
          where: {
            type: "courrier",
            id_domicilie: usager.ref,
          },
        });

        if (interactions.length > 0) {
          const interactionsToSave = interactions.map(
            (interaction) =>
              new InteractionsTable({
                usagerUUID: usager.uuid,
                usagerRef: usager.ref,
                dateInteraction: getDateFromXml(interaction.date),
                type: "visite",
                userId: 1200,
                userName: "DomiFa",
                structureId: TOULOUSE_STRUCTURE_ID,
                event: "create",
                interactionOutUUID: null,
              })
          );

          await interactionRepository.save(interactionsToSave);
        }
      }

      await usagerRepository.update(
        { uuid: In(usagerIdsToUpdate) },
        { migrated: true }
      );

      usagerIdsToUpdate = [];
      console.log(
        `${cpt}/${total} dossiers sont les passages sont importés ${format(
          new Date(),
          "HH:mm:ss"
        )}`
      );
      await queryRunner.commitTransaction();
    }

    await queryRunner.release();
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {
    //
  }
}
