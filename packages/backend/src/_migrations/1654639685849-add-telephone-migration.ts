import { TimeZone } from "../util/territoires/types/TimeZone.type";
import { MigrationInterface, QueryRunner } from "typeorm";
import { domifaConfig } from "../config";
import { structureRepository } from "../database";
import { appLogger } from "../util";
import { Structure } from "../_common/model";

const findTimeZonecountryCode = (timeZone: TimeZone): string => {
  switch (timeZone) {
    case "Europe/Paris":
      return "FR";
    case "America/Martinique":
      return "MQ";
    case "America/Cayenne":
      return "GF";
    case "Indian/Reunion":
      return "RE";
    case "Indian/Mayotte":
      return "YT";
    case "Pacific/Noumea":
      return "NC";
    case "Pacific/Tahiti":
      return "PF";
    case "Pacific/Wallis":
      return "WF";
    case "America/Miquelon":
      return "PM";
    default:
      return "FR";
  }
};

export class migrateStructurePhoneMigration1654639685849
  implements MigrationInterface
{
  name = "migrateStructurePhoneMigration1654639685849";
  public async up(queryRunner: QueryRunner): Promise<void> {
    if (
      domifaConfig().envId === "prod" ||
      domifaConfig().envId === "preprod" ||
      domifaConfig().envId === "local"
    ) {
      const structures: Structure[] = await (
        await structureRepository.typeorm()
      ).find({
        select: ["uuid", "phone", "timeZone"],
      });

      appLogger.warn("[MIGRATION] SELECT ALL STRUCTURE WITH PHONE");

      for (const structure of structures) {
        await structureRepository.updateOne(
          {
            uuid: structure.uuid,
          },
          {
            telephone: {
              countryCode: findTimeZonecountryCode(structure.timeZone),
              numero: structure.phone,
            },
          }
        );
      }
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
