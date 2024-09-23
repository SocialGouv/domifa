import { MigrationInterface } from "typeorm";
import { userUsagerCreator } from "../users/services";
import {
  usagerRepository,
  userUsagerRepository,
  userUsagerSecurityRepository,
} from "../database";

import { format } from "date-fns";
import { join } from "path";
import { writeFile } from "fs-extra";

export class ManualMigration1727093929792 implements MigrationInterface {
  public async up(): Promise<void> {
    const usagers = await usagerRepository.find({
      where: {
        structureId: 201,
        statut: "VALIDE",
      },
      select: ["uuid", "structureId", "dateNaissance"],
    });

    console.log(usagers.length + " comptes à créer");

    await userUsagerSecurityRepository.delete({ structureId: 201 });
    await userUsagerRepository.delete({ structureId: 201 });
    const credentials: Array<{ login: string; temporaryPassword: string }> = [];

    for (const usager of usagers) {
      if (credentials.length % 500 === 0) {
        console.log(`${credentials.length}/${usagers.length} comptes créés`);
      }

      const { login, temporaryPassword } =
        await userUsagerCreator.createUserWithTmpPassword(
          {
            usagerUUID: usager.uuid,
            structureId: usager.structureId,
          },
          {
            creator: {
              id: 201,
              prenom: "Bordeaux",
              nom: "",
            },
          },

          format(new Date(usager.dateNaissance), "ddMMyyyy")
        );

      credentials.push({ login, temporaryPassword });
    }
    const csvContent = credentials
      .map((cred) => `${cred.login},${cred.temporaryPassword}`)
      .join("\n");
    const csvHeader = "login,temporaryPassword\n";
    const fullCsvContent = csvHeader + csvContent;

    const outputPath = join("/tmp", "user_credentials.csv");
    await writeFile(outputPath, fullCsvContent);

    console.log(`Credentials exported to ${outputPath}`);
    throw new Error("lll");
  }

  public async down(): Promise<void> {}
}
