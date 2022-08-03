import { appLogger } from "./../util/AppLogger.service";
import { MigrationInterface, QueryRunner } from "typeorm";
import { domifaConfig } from "../config";
import { usagerRepository } from "../database";
import { isValidMobilePhone } from "../util/phone/phoneUtils.service";
import { COUNTRY_CODES_TIMEZONE } from "../_common/model";
import { TimeZone } from "./../util/territoires/types/TimeZone.type";

export class migratePhoneNumberUsagerMigration1657059112532
  implements MigrationInterface
{
  name = "migratePhoneNumberUsagerMigration1657059112532";

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async up(queryRunner: QueryRunner): Promise<void> {
    if (
      domifaConfig().envId === "prod" ||
      domifaConfig().envId === "preprod" ||
      domifaConfig().envId === "local"
    ) {
      appLogger.debug(
        "\n[MIGRATION] [TEL USAGERS] Migrer vers le nouveau format de téléphone - Start \n"
      );

      const usagers: {
        uuid: string;
        timeZone: TimeZone;
        structureId: number;
        phone: string;
        id: number;
      }[] = await (
        await usagerRepository.typeorm()
      ).query(
        `SELECT u.uuid, u.phone, u."structureId", u.telephone, s.id, s."timeZone" FROM usager u INNER JOIN structure s on s.id = u."structureId" WHERE u.phone != 'null' AND u.phone != '' AND (u.telephone->>'numero')::text = ''`
      );

      const codes: { [key in TimeZone]: number } = {
        "America/Guadeloupe": 0,
        "America/Martinique": 0,
        "America/Cayenne": 0,
        "Indian/Reunion": 0,
        "Indian/Mayotte": 0,
        "Europe/Paris": 0,
        "Pacific/Noumea": 0,
        "Pacific/Tahiti": 0,
        "Pacific/Wallis": 0,
        "America/Miquelon": 0,
        "Indian/Maldives": 0,
      };

      let cpt = 0;
      let cptFailPhones = 0;

      for (const usager of usagers) {
        if (cpt % 1000 === 0) {
          console.log(cpt + "/" + usagers.length + " usagers migrés");
        }
        cpt++;

        codes[usager.timeZone] = codes[usager.timeZone] + 1;

        const telephone = {
          countryCode: COUNTRY_CODES_TIMEZONE[usager.timeZone],
          numero: usager.phone.toString().replace(/[^0-9]/g, ""),
        };

        if (!isValidMobilePhone(telephone)) {
          cptFailPhones++;
        }

        await usagerRepository.updateOne({ uuid: usager.uuid }, { telephone });
      }
      console.log();
      console.log(usagers.length + " usagers avec téléphone à migrer");
      console.log(codes);
      console.log(cptFailPhones + " numéros non-enregistrés car foireux");
      console.log();
    }

    console.warn(
      "\n[MIGRATION] [TEL USAGERS] Migrer vers le nouveau format de téléphone - END \n"
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function
  public async down(queryRunner: QueryRunner): Promise<void> {}
}
