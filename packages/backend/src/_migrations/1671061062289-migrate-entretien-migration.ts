import { usagerEntretienRepository } from "../database/services/usager/usagerEntretienRepository.service";
import { In, MigrationInterface, QueryRunner } from "typeorm";
import { UsagerEntretien } from "../_common/model";
import { usagerRepository, typeOrmSearch, UsagerTable } from "../database";

export class manualMigration1671061062289 implements MigrationInterface {
  name = "manualMigration1671061062289";
  public async up(queryRunner: QueryRunner): Promise<void> {
    console.log("manualMigration1670972919865");
    const total = await usagerRepository.countMigratedUsagers();
    let counter = 1;

    while ((await usagerRepository.countMigratedUsagers()) > 0) {
      const usagers = await queryRunner.query(
        `select uuid, "oldEntretien", ref, "structureId" from usager u where migrated is false LIMIT 1000`
      );

      const entretienToSave: UsagerEntretien[] = [];
      const usagersToUpdate: string[] = [];

      for (const usager of usagers) {
        const entretienToPush: UsagerEntretien = {
          ...usager.oldEntretien,
          usagerRef: usager.ref,
          usagerUUID: usager.uuid,
          structureId: usager.structureId,
        };
        entretienToSave.push(entretienToPush);
        usagersToUpdate.push(usager.uuid);
        counter++;
      }

      console.log("Ajout des entretiens restantes : " + entretienToSave.length);
      await usagerEntretienRepository.save(entretienToSave);

      await usagerRepository.update(
        typeOrmSearch<UsagerTable>({
          uuid: In(usagersToUpdate),
        }),
        {
          migrated: true,
        }
      );
      console.log(
        "Mise à jour des usagers restants:  " + counter + "/" + total
      );
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars
  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
