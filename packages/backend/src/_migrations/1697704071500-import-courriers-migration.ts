/* eslint-disable @typescript-eslint/no-unused-vars */
import { In, IsNull, MigrationInterface, QueryRunner } from "typeorm";
import {
  TOULOUSE_STRUCTURE_ID,
  TOULOUSE_USER_ID,
  getDateFromXml,
} from "../_common/tmp-toulouse";
import {
  interactionRepository,
  myDataSource,
  structureRepository,
  usagerRepository,
  userStructureRepository,
} from "../database";
import { tmpCourriersRepository } from "../database/services/interaction/historiqueRepository.service";
import { interactionsCreator } from "../interactions/services";
import { InteractionDto } from "../interactions/dto";
import { MOTIF } from "../_common/tmp-toulouse/MOTIF.const";
import { format } from "date-fns";

export class ManualMigration1697704071500 implements MigrationInterface {
  public async up(): Promise<void> {
    const queryRunner = myDataSource.createQueryRunner();
    await queryRunner.startTransaction();
    console.log("");
    console.log("Lancement de la migration d'import des courriers");
    console.log("");

    console.log("Mise à jour des dossiers");
    await usagerRepository.update(
      { structureId: TOULOUSE_STRUCTURE_ID },
      { migrated: false }
    );

    console.log("Suppression des courriers");
    await interactionRepository.delete({
      structureId: TOULOUSE_STRUCTURE_ID,
      type: In(["courrierIn", "courrierOut"]),
    });

    console.log("Suppression des courriers temporaires non exploitables");
    await tmpCourriersRepository.delete({
      date: IsNull(),
    });
    await queryRunner.commitTransaction();

    const user: any = await userStructureRepository.findOneBy({
      structureId: TOULOUSE_STRUCTURE_ID,
      id: TOULOUSE_USER_ID,
    });

    const structure = await structureRepository.findOneBy({
      id: TOULOUSE_STRUCTURE_ID,
    });

    let cpt = 0;

    user.structure = structure;

    console.log("Début de l'import courriers des usagers");

    const total = await usagerRepository.countMigratedUsagers();

    while ((await usagerRepository.countMigratedUsagers()) > 0) {
      await queryRunner.startTransaction();

      const usagers = await usagerRepository.find({
        where: { structureId: TOULOUSE_STRUCTURE_ID, migrated: false },
        take: 400,
      });

      const usagerIdsToUpdate = [];

      for (const usager of usagers) {
        cpt++;
        usagerIdsToUpdate.push(usager.uuid);
        const interactions = await tmpCourriersRepository.find({
          where: {
            IDDomicilie: usager.ref,
          },
          order: {
            date: "ASC",
            Date_recup: "ASC",
          },
        });

        if (interactions.length > 0) {
          for (const interaction of interactions) {
            const newInteraction: InteractionDto = {
              usagerRef: usager.ref,
              userId: user.id,
              userName: user.nom + " " + user.prenom,
              type: "courrierIn",
              nbCourrier: 1,
              content: this.getMotif(interaction.motif),
              dateInteraction: getDateFromXml(interaction.date),
            };

            await interactionsCreator.createInteraction({
              interaction: newInteraction,
              user,
              usager,
            });

            if (interaction?.Date_recup) {
              const newInteraction: InteractionDto = {
                usagerRef: usager.ref,
                userId: user.id,
                userName: user.nom + " " + user.prenom,
                type: "courrierOut",
                nbCourrier: 1,
                content: this.getMotif(interaction.motif),
                dateInteraction: getDateFromXml(interaction.Date_recup),
              };

              await interactionsCreator.createInteraction({
                interaction: newInteraction,
                user,
                usager,
              });
            }
          }
        }
      }

      await usagerRepository.update(
        { uuid: In(usagerIdsToUpdate) },
        { migrated: true }
      );

      console.log(
        `${cpt}/${total} dossiers sont les courriers sont importés ${format(
          new Date(),
          "HH:mm:ss"
        )}`
      );
      await queryRunner.commitTransaction();
    }
    await queryRunner.commitTransaction();
    await queryRunner.release();
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {
    //
  }

  public getMotif(motif?: number) {
    if (!motif || motif === 0) {
      return "";
    }
    return MOTIF[motif] ?? "";
  }
}
