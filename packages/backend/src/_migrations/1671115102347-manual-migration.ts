import { messageSmsRepository } from "./../database/services/message-sms/messageSmsRepository.service";
import { structureRepository } from "./../database/services/structure/structureRepository.service";
import { MigrationInterface, QueryRunner } from "typeorm";
import { Structure } from "../_common/model";
import { generateSender } from "../sms/services/generators";

export class manualMigration1671115102347 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const structures: Structure[] = await queryRunner.query(
      "SELECT nom, id, sms FROM structure where (sms->>'enabledByDomifa')::boolean is true and (sms->>'enabledByStructure')::boolean is true"
    );

    for (const structure of structures) {
      console.log({
        name: structure.nom,
        senderName: structure.sms.senderName,
      });

      if (
        structure.sms.senderName === "" ||
        structure.sms.senderName === null
      ) {
        structure.sms.senderName = generateSender(structure.sms.senderName);
      } else {
        structure.sms.senderName = structure.sms.senderName
          .replace(/[^\w\s]/gi, "")
          .trim()
          .substring(0, 11)
          .toUpperCase();
      }

      structure.sms.senderName = structure.sms.senderName.trim();

      await structureRepository.update(
        { id: structure.id },
        { sms: structure.sms }
      );

      await messageSmsRepository.update(
        { structureId: structure.id },
        { senderName: structure.sms.senderName }
      );
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars
  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
