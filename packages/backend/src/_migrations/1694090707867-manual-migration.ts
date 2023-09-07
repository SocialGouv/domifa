import { Usager, UsagerOptions, UserStructureProfile } from "../_common/model";
import { userUsagerCreator } from "../users/services";
import { format } from "date-fns";
import { getPhoneString } from "../util/phone";
import { join } from "path";
import { appendFile, ensureDir } from "fs-extra";
import { MigrationInterface, QueryRunner } from "typeorm";
import { domifaConfig } from "../config";
import { userStructureRepository, usagerRepository } from "../database";

const serializeUserUsager = (newUserUsager: any) => {
  const {
    ref,
    customRef,
    nom,
    prenom,
    dateNaissance,
    telephone,
    login,
    temporaryPassword,
  } = newUserUsager;

  return `${ref}\t${customRef}\t${nom}\t${prenom}\t${dateNaissance}\t${telephone}\t${login}\t${temporaryPassword}`;
};

export class ManualMigration1694090707866 implements MigrationInterface {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async up(_queryRunner: QueryRunner): Promise<void> {
    const message = "[MIGRATION] [BORDEAUX] ";
    await ensureDir(join(domifaConfig().upload.basePath, "tmp-bordeaux"));

    const fileName = join(
      domifaConfig().upload.basePath,
      "tmp-bordeaux",
      "comptes-bordeaux"
    );

    console.log(message + "Activation des comptes usagers de bordeaux");

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

      const options: UsagerOptions = {
        ...usager.options,
        portailUsagerEnabled: true,
      };

      await usagerRepository.update({ uuid: usager.uuid }, { options });
      await appendFile(fileName, serializeUserUsager(newUserUsager) + "\n");

      cpt++;
      if (cpt % 200 === 0) {
        console.log(message + cpt + "/" + usagers.length + " comptes créés");
      }
    }

    console.log(message + cpt + "/" + usagers.length + " comptes créés");
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async down(_queryRunner: QueryRunner): Promise<void> {
    //
  }
}
