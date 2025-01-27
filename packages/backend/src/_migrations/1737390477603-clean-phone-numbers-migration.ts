import { MigrationInterface, QueryRunner } from "typeorm";
import { domifaConfig } from "../config";

export class CleanPhoneNumbers1737390477603 implements MigrationInterface {
  name = "cleanPhoneNumbers1737390477603";

  public async up(queryRunner: QueryRunner): Promise<void> {
    if (
      domifaConfig().envId === "prod" ||
      domifaConfig().envId === "preprod" ||
      domifaConfig().envId === "local"
    ) {
      await queryRunner.query(`
      UPDATE usager
      SET telephone = jsonb_set(
        telephone,
        '{numero}',
        to_jsonb(REPLACE(telephone->>'numero', ' ', ''))
      )
      WHERE telephone->>'numero' LIKE '% %';
    `);
    }
  }

  public async down(): Promise<void> {
    console.log(
      "Cette migration ne peut pas être annulée car les positions des espaces d'origine ne sont pas conservées"
    );
  }
}
