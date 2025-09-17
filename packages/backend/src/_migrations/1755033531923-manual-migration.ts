import { MigrationInterface, QueryRunner } from "typeorm";
import { domifaConfig } from "../config";
import { appLogger } from "../util";

export class ManualMigration1755033531923 implements MigrationInterface {
  name: string = "ManualMigration1755033531923";
  public async up(queryRunner: QueryRunner): Promise<void> {
    if (
      domifaConfig().envId === "prod" ||
      domifaConfig().envId === "preprod" ||
      domifaConfig().envId === "dev" ||
      domifaConfig().envId === "local"
    ) {
      appLogger.info("Starting migration: Updating structures SMS schedules");
      await queryRunner.query(`
        UPDATE structure
        SET sms = sms || '{"schedule": {"monday": false, "tuesday": true, "wednesday": false, "thursday": true, "friday": false}}'::jsonb
        WHERE
          (sms->>'enabledByStructure')::boolean = TRUE
          AND (sms->'schedule'->>'friday')::boolean = FALSE
          AND (sms->'schedule'->>'monday')::boolean = FALSE
          AND (sms->'schedule'->>'thursday')::boolean = FALSE
          AND (sms->'schedule'->>'tuesday')::boolean = FALSE
          AND (sms->'schedule'->>'wednesday')::boolean = FALSE;
      `);

      const count = await queryRunner.query(`
        SELECT COUNT(*) FROM structure
        WHERE
        (sms->>'enabledByStructure')::boolean = TRUE
        AND (sms->'schedule'->>'friday')::boolean = FALSE
        AND (sms->'schedule'->>'monday')::boolean = FALSE
        AND (sms->'schedule'->>'thursday')::boolean = FALSE
        AND (sms->'schedule'->>'tuesday')::boolean = FALSE
        AND (sms->'schedule'->>'wednesday')::boolean = FALSE;
      `);

      console.log(count);
      appLogger.info("Migration end");
    }
  }

  public async down(): Promise<void> {
    if (
      domifaConfig().envId === "prod" ||
      domifaConfig().envId === "preprod" ||
      domifaConfig().envId === "local"
    ) {
      appLogger.info("No down migration can be applied");
    }
  }
}
