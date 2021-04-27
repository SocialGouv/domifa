import {MigrationInterface, QueryRunner} from "typeorm";

export class autoMigration1619532512605 implements MigrationInterface {
    name = 'autoMigration1619532512605'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "IDX_870780802d799a6c16a6a86e40"`);
        await queryRunner.query(`CREATE TABLE "usager_history" ("uuid" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "version" integer NOT NULL, "usagerUUID" uuid NOT NULL, "usagerRef" integer NOT NULL, "structureId" integer NOT NULL, "decisions" jsonb NOT NULL, "ayantsDroits" jsonb NOT NULL, "entretiens" jsonb NOT NULL, CONSTRAINT "UQ_7356ee08f3ac6e3e1c6fe08bd81" UNIQUE ("usagerUUID"), CONSTRAINT "UQ_29a873927e96c4290d288d594f4" UNIQUE ("structureId", "usagerRef"), CONSTRAINT "PK_29638b771d16000882db14bab40" PRIMARY KEY ("uuid"))`);
        await queryRunner.query(`CREATE INDEX "IDX_7356ee08f3ac6e3e1c6fe08bd8" ON "usager_history" ("usagerUUID") `);
        await queryRunner.query(`CREATE INDEX "IDX_36a2e869faca3bb31cbacdf81b" ON "usager_history" ("structureId") `);
        await queryRunner.query(`ALTER TABLE "structure" DROP CONSTRAINT "UQ_870780802d799a6c16a6a86e40e"`);
        await queryRunner.query(`ALTER TABLE "structure" DROP COLUMN "mongoStructureId"`);
        await queryRunner.query(`ALTER TABLE "structure" ALTER COLUMN "sms" SET DEFAULT '{ enabledByDomifa: false, enabledByStructure: false, senderName: null, senderDetails: null }'`);
        await queryRunner.query(`ALTER TABLE "usager" ALTER COLUMN "preference" SET DEFAULT '{"email": false, "phone": false, "phoneNumber":null}'`);
        await queryRunner.query(`ALTER TABLE "usager_history" ADD CONSTRAINT "FK_7356ee08f3ac6e3e1c6fe08bd81" FOREIGN KEY ("usagerUUID") REFERENCES "usager"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "usager_history" ADD CONSTRAINT "FK_36a2e869faca3bb31cbacdf81ba" FOREIGN KEY ("structureId") REFERENCES "structure"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "usager_history" DROP CONSTRAINT "FK_36a2e869faca3bb31cbacdf81ba"`);
        await queryRunner.query(`ALTER TABLE "usager_history" DROP CONSTRAINT "FK_7356ee08f3ac6e3e1c6fe08bd81"`);
        await queryRunner.query(`ALTER TABLE "usager" ALTER COLUMN "preference" SET DEFAULT '{"email": false, "phone": false, "phoneNumber": null}'`);
        await queryRunner.query(`ALTER TABLE "structure" ALTER COLUMN "sms" SET DEFAULT '{"senderName": null, "senderDetails": null, "enabledByDomifa": false, "enabledByStructure": false}'`);
        await queryRunner.query(`ALTER TABLE "structure" ADD "mongoStructureId" integer`);
        await queryRunner.query(`ALTER TABLE "structure" ADD CONSTRAINT "UQ_870780802d799a6c16a6a86e40e" UNIQUE ("mongoStructureId")`);
        await queryRunner.query(`DROP INDEX "IDX_36a2e869faca3bb31cbacdf81b"`);
        await queryRunner.query(`DROP INDEX "IDX_7356ee08f3ac6e3e1c6fe08bd8"`);
        await queryRunner.query(`DROP TABLE "usager_history"`);
        await queryRunner.query(`CREATE INDEX "IDX_870780802d799a6c16a6a86e40" ON "structure" ("mongoStructureId") `);
    }

}
