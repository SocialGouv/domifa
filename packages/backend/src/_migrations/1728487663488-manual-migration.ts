import { MigrationInterface } from "typeorm";
import { appLogsRepository } from "../database";
import { domifaConfig } from "../config";

export class DeleteUselessLogsMigration1728487663488
  implements MigrationInterface
{
  name = "DeleteUselessLogsMigration1728487663488";

  public async up(): Promise<void> {
    if (
      domifaConfig().envId === "prod" ||
      domifaConfig().envId === "preprod" ||
      domifaConfig().envId === "local"
    ) {
      await appLogsRepository.delete({
        action: "USAGERS_DOCS_DOWNLOAD",
      });
    }
  }

  public async down(): Promise<void> {
    //
  }
}
