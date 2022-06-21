import { MigrationInterface } from "typeorm";

import { domifaConfig } from "../config";
import { structureRepository } from "../database/services/structure/structureRepository.service";
import { Structure } from "../_common/model";
import { appLogger } from "../util";

const findTimeZoneIndicatif = (timeZone: string): string => {
  switch (timeZone) {
    case "Europe/Paris":
      return "fr";
    case "America/Martinique":
      return "mq";
    case "America/Cayenne":
      return "gf";
    case "Indian/Reunion":
      return "re";
    case "Indian/Mayotte":
      return "yt";
    case "Pacific/Noumea":
      return "nc";
    case "Pacific/Tahiti":
      return "pf";
    case "Pacific/Wallis":
      return "wf";
    case "America/Miquelon":
      return "pm";
    default:
      return "fr";
  }
};

export class migrateStructurePhoneMigration1651583710799
  implements MigrationInterface
{
  name = "migrateStructurePhone1651583710799";
  public async up(): Promise<void> {
    if (
      domifaConfig().envId === "prod" ||
      domifaConfig().envId === "preprod" ||
      domifaConfig().envId === "local"
    ) {
      const structures: Structure[] = await (
        await structureRepository.typeorm()
      ).query(
        `
        SELECT uuid, phone, "timeZone"
        FROM structure
        WHERE phone != '' and phone != null
      `
      );
      appLogger.warn("[MIGRATION] SELECT ALL STRUCTURE WITH PHONE");

      for (const structure of structures) {
        await structureRepository.updateOne(
          {
            uuid: structure.uuid,
          },
          {
            telephone: {
              countryCode: findTimeZoneIndicatif(structure.timeZone),
              numero: structure.phone,
            },
          }
        );
      }
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  public async down(): Promise<void> {}
}
