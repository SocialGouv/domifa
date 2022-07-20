import { MigrationInterface, QueryRunner } from "typeorm";
import { domifaConfig } from "../config";
import { usagerRepository } from "../database";

import { TimeZone } from "../util/territoires";
import {
  COUNTRY_CODES_TIMEZONE,
  UsagerPreferenceContact,
} from "../_common/model";

export class migratePhonePreferenceMigration1657059112533
  implements MigrationInterface
{
  name = "migratePhonePreferenceMigration1657059112533";

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async up(queryRunner: QueryRunner): Promise<void> {
    if (
      domifaConfig().envId === "prod" ||
      domifaConfig().envId === "preprod" ||
      domifaConfig().envId === "local"
    ) {
      console.warn(
        "\n[MIGRATION] [TEL SMS] Migrer vers le nouveau format de téléphone - Start \n"
      );
      const usagers: {
        uuid: string;
        timeZone: TimeZone;
        preference: UsagerPreferenceContact;
        structureId: number;
        phone: string;
        id: number;
      }[] = await (
        await usagerRepository.typeorm()
      ).query(
        `
        SELECT u.uuid, u.preference, u."structureId", s.id, s."timeZone" FROM usager u INNER JOIN structure s on s.id = u."structureId"
        WHERE (preference->'phoneNumber')::text != 'null' AND (preference->'phoneNumber')::text != '' AND (preference->>'phone')::bool is true
      `
      );

      console.log(usagers.length + " usagers concernés par la migration");

      const codes: { [key in TimeZone]: number } = {
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
      for (const usager of usagers) {
        if (cpt % 1000 === 0) {
          console.log(cpt + "/" + usagers.length + " usagers migrés");
        }
        cpt++;
        codes[usager.timeZone] = codes[usager.timeZone] + 1;
        await usagerRepository.updateOne(
          {
            uuid: usager.uuid,
          },
          {
            preference: {
              contactByPhone: true,
              telephone: {
                countryCode: COUNTRY_CODES_TIMEZONE[usager.timeZone],
                numero: usager.preference.phoneNumber
                  .toString()
                  .replace(/[^0-9]/g, ""),
              },
            },
          }
        );
      }
      console.log();
      console.log(codes);
      console.log();
    }

    console.warn(
      "\n[MIGRATION] [TEL SMS] Migrer vers le nouveau format de téléphone - END \n"
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function
  public async down(queryRunner: QueryRunner): Promise<void> {}
}
