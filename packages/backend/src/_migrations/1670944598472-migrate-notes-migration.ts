import { usagerRepository } from "../database/services/usager/usagerRepository.service";
import { usagerNotesRepository } from "../database/services/usager/usagerNotesRepository.service";
import { In, MigrationInterface, QueryRunner } from "typeorm";
import { UsagerNote } from "../_common/model";
import { typeOrmSearch, UsagerTable } from "../database";

export class migrateNotesMigration1670944598472 implements MigrationInterface {
  name = "migrateNotesMigration1670944598472";

  public async up(queryRunner: QueryRunner): Promise<void> {
    const usagers = await queryRunner.query(
      `select uuid, "oldNotes", ref, "structureId" from usager u where "oldNotes" != '[]' and "oldNotes" is not null`
    );

    let counter = 1;
    let notesToSave: UsagerNote[] = [];
    let usagersToUpdate: string[] = [];

    console.log("Mise à jour des usager " + counter + "/" + usagers.length);

    for await (const usager of usagers) {
      for (const note of usager.oldNotes) {
        const noteToPush: UsagerNote = {
          ...note,
          usagerRef: usager.ref,
          usagerUUID: usager.uuid,
          structureId: usager.structureId,
        };
        notesToSave.push(noteToPush);
      }

      usagersToUpdate.push(usager.uuid);

      if (counter % 500 === 0) {
        console.log("");
        console.log("Ajout des notes " + notesToSave.length);
        await usagerNotesRepository.save(notesToSave);

        console.log("Mise à jour des usager " + counter + "/" + usagers.length);
        await usagerRepository.update(
          typeOrmSearch<UsagerTable>({
            uuid: In(usagersToUpdate),
          }),
          {
            oldNotes: [],
          }
        );
        console.log(
          "Enregistrement en cours " + counter + "/" + usagers.length
        );
        usagersToUpdate = [];
        notesToSave = [];
      }
      counter++;
    }

    console.log("FIN : Ajout des notes restantes : " + notesToSave.length);
    await usagerNotesRepository.save(notesToSave);

    console.log(
      "FIN : Mise à jour des usagers restants:  " +
        counter +
        "/" +
        usagers.length
    );

    await usagerRepository.update(
      typeOrmSearch<UsagerTable>({
        uuid: In(usagersToUpdate),
      }),
      { oldNotes: [] }
    );

    console.log("Enregistrement terminé ");
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function
  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
