import { MigrationInterface, QueryRunner } from "typeorm";
import {
  myDataSource,
  usagerEntretienRepository,
  usagerRepository,
} from "../database";
import { TOULOUSE_STRUCTURE_ID } from "../_common/tmp-toulouse";

export class ManualMigration1692191990703 implements MigrationInterface {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async up(_queryRunner: QueryRunner): Promise<void> {
    console.log("Suppression des entretiens ... 🏃‍♀️");
    await usagerEntretienRepository.delete({
      structureId: TOULOUSE_STRUCTURE_ID,
    });

    const usagers = await usagerRepository.find({
      where: { structureId: TOULOUSE_STRUCTURE_ID },
      select: { uuid: true, ref: true },
    });

    let i = 0;
    console.log("Création des entretiens ... 🏃‍♀️");

    const queryRunner = myDataSource.createQueryRunner();
    await queryRunner.startTransaction();

    for (const usager of usagers) {
      i++;
      if (i % 4000 === 0) {
        await queryRunner.commitTransaction();
        console.log(i + "/" + usagers.length + " entretiens importés");
        await queryRunner.startTransaction();
      }

      await usagerEntretienRepository.save({
        structureId: TOULOUSE_STRUCTURE_ID,
        usagerUUID: usager.uuid,
        usagerRef: usager.ref,
      });
    }
    await queryRunner.release();

    console.log("3️⃣ Création des entretiens terminée ✅ ");
  }

  public async down(): Promise<void> {
    console.log("down");
  }
}
