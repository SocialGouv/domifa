import { Usager, UsagerOptions, UserStructureProfile } from "../_common/model";
import { userUsagerCreator } from "../users/services";
import { format } from "date-fns";
import { getPhoneString } from "../util/phone";
import { join } from "path";
import { ensureDir, writeFile } from "fs-extra";
import { MigrationInterface, QueryRunner } from "typeorm";
import { domifaConfig } from "../config";
import { userStructureRepository, usagerRepository } from "../database";

export class ManualMigration1694090707865 implements MigrationInterface {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async up(_queryRunner: QueryRunner): Promise<void> {
    const message = "[MIGRATION] [BORDEAUX] ";
    await ensureDir(join(domifaConfig().upload.basePath, "tmp-bordeaux"));
    console.log(message + "Activation des comptes usagers de bordeaux");

    let jsonToExport: {
      ref: number;
      telephone: string;
      nom: string;
      prenom: string;
      login: string;
      temporaryPassword: string;
      customRef: string;
      dateNaissance: string;
    }[] = [];

    const user: UserStructureProfile = await userStructureRepository.findOneBy({
      role: "admin",
      structureId: 201,
    });

    const usagers: Partial<Usager>[] = await usagerRepository
      .createQueryBuilder("usager")
      .where(
        `decision->>'statut' = :statut and "structureId" = :structureId and (options->>'portailUsagerEnabled')::boolean is false`,
        { structureId: 201, statut: "VALIDE" }
      )
      .select(
        `"uuid", "structureId", "dateNaissance", "telephone", "nom", "prenom", "customRef", "ref", "options"`
      )
      .execute();

    console.log(message + usagers.length + " comptes usagers à créer");

    let cpt = 0;
    for (const usager of usagers) {
      const { login, temporaryPassword } =
        await userUsagerCreator.createUserWithTmpPassword(
          {
            usagerUUID: usager.uuid,
            structureId: usager.structureId,
          },
          { creator: user }
        );

      const newUserUsager = {
        ref: usager.ref,
        customRef: usager.customRef,
        nom: usager.nom,
        prenom: usager.prenom,
        dateNaissance: format(new Date(usager.dateNaissance), "dd/MM/yyyy"),
        telephone: getPhoneString(usager.telephone),
        login,
        temporaryPassword,
      };
      jsonToExport.push(newUserUsager);

      const options: UsagerOptions = {
        ...usager.options,
        portailUsagerEnabled: true,
      };

      await usagerRepository.update({ uuid: usager.uuid }, { options });

      cpt++;
      if (cpt % 500 === 0) {
        const fileName = join(
          domifaConfig().upload.basePath,
          "tmp-bordeaux",
          "export_bordeaux" + Date.now() + ".json"
        );
        await writeFile(fileName, JSON.stringify(jsonToExport));
        jsonToExport = [];
        console.log(message + " écriture du fichier " + fileName);
        console.log(message + cpt + "/" + usagers.length + " comptes créés");
      }
    }
    const fileName = join(
      domifaConfig().upload.basePath,
      "tmp-bordeaux",
      "export_bordeaux" + Date.now() + ".json"
    );
    await writeFile(fileName, JSON.stringify(jsonToExport));

    console.log(message + " écriture du fichier " + fileName);
    console.log(message + cpt + "/" + usagers.length + " comptes créés");
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async down(_queryRunner: QueryRunner): Promise<void> {
    //
  }
}
