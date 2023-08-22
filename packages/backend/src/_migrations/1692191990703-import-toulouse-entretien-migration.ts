import { MigrationInterface } from "typeorm";
import { usagerEntretienRepository, usagerRepository } from "../database";

const STRUCTURE_ID = 1;

export class ManualMigration1692191990703 implements MigrationInterface {
  public async up(): Promise<void> {
    console.log("3️⃣ Création des entretiens commencée");

    const usagers = await usagerRepository.find({
      where: { structureId: STRUCTURE_ID },
      select: { uuid: true, ref: true },
    });

    let i = 0;
    let usagersToSave = [];

    console.log(usagers.length);

    for (const usager of usagers) {
      if (i % 300 === 0) {
        await usagerEntretienRepository.save(usagersToSave);
        usagersToSave = [];
      }

      if (i % 2000 === 0) {
        console.log(i + "/" + usagers.length + " entretien créés");
      }

      usagersToSave.push({
        structureId: STRUCTURE_ID,
        usagerUUID: usager.uuid,
        usagerRef: usager.ref,
      });
      i++;
    }

    await usagerEntretienRepository.save(usagersToSave);
    console.log("3️⃣ ✅ Création des entretiens commencée");
  }

  public async down(): Promise<void> {
    console.log("down");
  }
}
