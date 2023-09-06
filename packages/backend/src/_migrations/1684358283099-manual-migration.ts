import { MigrationInterface, QueryRunner } from "typeorm";
import { Usager, UsagerOptions, UserStructureProfile } from "../_common/model";
import {
  usagerRepository,
  userStructureRepository,
  userUsagerRepository,
} from "../database";
import { userUsagerCreator } from "../users/services";
import { format } from "date-fns";
import { getPhoneString } from "../util/phone";
import { join } from "path";
import { domifaConfig } from "../config";
import { writeFile } from "fs-extra";

export class ManualMigration1684358283099 implements MigrationInterface {
  public async up(): Promise<void> {
    if (
      domifaConfig().envId === "preprod" ||
      domifaConfig().envId === "prod" ||
      domifaConfig().envId === "local"
    ) {
      const message = "[MIGRATION] [BORDEAUX] ";
      console.log(message + "Suppression des comptes usagers de Bordeaux");

      await userUsagerRepository.delete({
        structureId: 201,
      });

      console.log(message + "Activation des sms pour les usagers de bordeaux");

      await usagerRepository
        .createQueryBuilder("usager")
        .update({
          contactByPhone: true,
        })
        .where(
          `telephone->>'numero' != '' and decision->>'statut' = :statut and "structureId" = :structureId `,
          { structureId: 201, statut: "VALIDE" }
        )
        .execute();

      console.log(message + "Activation des comptes usagers de bordeaux");

      const jsonToExport: {
        ref: number;
        telephone: string;
        nom: string;
        prenom: string;
        login: string;
        temporaryPassword: string;
        customRef: string;
        dateNaissance: string;
      }[] = [];

      const user: UserStructureProfile =
        await userStructureRepository.findOneBy({
          role: "admin",
          structureId: 201,
        });

      const usagers: Partial<Usager>[] = await usagerRepository
        .createQueryBuilder("usager")
        .where(
          `decision->>'statut' = :statut and "structureId" = :structureId `,
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

        const options: UsagerOptions = {
          ...usager.options,
          portailUsagerEnabled: true,
        };

        await usagerRepository.update({ uuid: usager.uuid }, { options });

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

        cpt++;
        if (cpt % 200 === 0) {
          console.log(message + cpt + "/" + usagers.length + " comptes créés");
        }
      }
      console.log(message + " écriture du fichier");

      await writeFile(
        join(domifaConfig().upload.basePath, "export_bordeaux.json"),
        JSON.stringify(jsonToExport)
      );
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function
  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
