import { MigrationInterface, QueryRunner } from "typeorm";

// Banned IPs are stored in `app_ip_ban` and replicated to each pod via an
// in-memory cache refreshed every 5 minutes (polling, no LISTEN/NOTIFY).
// `expiresAt` NULL means a permanent ban; the cache filters expired rows in
// memory so they stop blocking immediately even before the next refresh tick.

export class CreateAppIpBanTable1781643997192 implements MigrationInterface {
  name = "CreateAppIpBanTable1781643997192";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "app_ip_ban" (
        "uuid" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "createdAt" timestamp with time zone NOT NULL DEFAULT now(),
        "updatedAt" timestamp with time zone NOT NULL DEFAULT now(),
        "version" integer NOT NULL,
        "ip" text NOT NULL,
        "reason" text NOT NULL,
        "expiresAt" timestamp with time zone,
        "context" jsonb,
        "createdBy" text,
        CONSTRAINT "PK_app_ip_ban" PRIMARY KEY ("uuid"),
        CONSTRAINT "UQ_app_ip_ban_ip" UNIQUE ("ip")
      )
    `);

    await queryRunner.query(
      `CREATE INDEX "IDX_app_ip_ban_ip" ON "app_ip_ban" ("ip")`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_app_ip_ban_expiresAt" ON "app_ip_ban" ("expiresAt")`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "app_ip_ban"`);
  }
}
