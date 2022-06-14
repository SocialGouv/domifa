import { TimeZone } from "../util/territoires/types/TimeZone.type";
import { MigrationInterface, QueryRunner } from "typeorm";
import { domifaConfig } from "../config";
import { structureRepository } from "../database";
import { appLogger } from "../util";
import { Structure } from "../_common/model";

const findTimeZonecountryCode = (timeZone: TimeZone): string => {
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

export class migrateStructurePhoneMigration1654639685849
  implements MigrationInterface
{
  name = "migrateStructurePhoneMigration1654639685849";
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async down(queryRunner: QueryRunner): Promise<void> {}
}
