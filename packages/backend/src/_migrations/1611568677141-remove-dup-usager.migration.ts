import { MigrationInterface, QueryRunner } from "typeorm";
import { domifaConfig } from "../config";
import { usagerRepository } from "../database";
import { appLogger } from "../util";

export class autoMigration1611568677141 implements MigrationInterface {
  name = "autoMigration1611568677141";

  public async up(queryRunner: QueryRunner): Promise<void> {
    appLogger.debug(
      `[Migration] UP "${this.name}" (env:${domifaConfig().envId})`
    );

    await this.removeDuplicated(queryRunner);

    appLogger.debug(
      `[Migration] [SUCCESS] "${this.name}" UsagerTable migrated totally`
    );
  }

  private async removeDuplicated(queryRunner: QueryRunner) {
    await queryRunner.query(
      `
            DELETE FROM usager u1 where (
              SELECT count(u2.*) from usager u2 where u1."ref" = u2."ref" and u1."structureId" =u2."structureId" and u1."uuid" <> u2."uuid" and u1."prenom" = u2."prenom" and  u1."nom" = u2."nom" and  u1."dateNaissance" = u2."dateNaissance" 
              and u2.historique <> '[]'
              group by "structureId", "ref"
            ) >= 1 and u1.historique = '[]';
            `
    );
    await queryRunner.query(
      `
            DELETE FROM usager u1 where (
              SELECT count(u2.*) from usager u2 where u1."ref" = u2."ref" and u1."structureId" =u2."structureId" and u1."uuid" <> u2."uuid" and u1."prenom" = u2."prenom" and  u1."nom" = u2."nom" and  u1."dateNaissance" = u2."dateNaissance" 
              and u2.entretien->'cause'::text <> 'null'
              group by "structureId", "ref"
            ) >= 1 and u1.entretien->'cause'::text ='null';
            `
    );
    await queryRunner.query(
      `
            delete FROM usager u1 where (
              SELECT count(u2.*) from usager u2 where u1."ref" = u2."ref" and u1."structureId" =u2."structureId" and u1."uuid" <> u2."uuid" and u1."prenom" = u2."prenom" and  u1."nom" = u2."nom" and  u1."dateNaissance" = u2."dateNaissance" 
              and u2._id > u1._id
              group by "structureId", "ref"
            ) >= 1;
            `
    );

    const usagerRepositoryForMigration = await usagerRepository.getForMigration(
      queryRunner.manager
    );

    const duplicated = await usagerRepositoryForMigration.findManyWithQuery<{
      UsagerTable_uuid: string;
      UsagerTable_ref: string;
    }>({
      where: `(
              SELECT count(u2.*) from usager u2 where "UsagerTable"."ref" = u2."ref" and "UsagerTable"."structureId" =u2."structureId" and "UsagerTable"."uuid" <> u2."uuid"
              group by "structureId", "ref"
            ) >= 1`,
    });

    console.log(
      `[Migration] "${this.name}": cleaning ${duplicated.length} duplicated usagers:"`
    );

    const refs = [];
    const maxRef = await usagerRepositoryForMigration.max({
      maxAttribute: "ref",
    });
    let nextRef = maxRef ? maxRef + 1 : 1;
    for (const dup of duplicated) {
      if (refs.includes(dup.UsagerTable_ref)) {
        const usager = await usagerRepositoryForMigration.findOne({
          uuid: dup.UsagerTable_uuid,
        });
        const previousRef = usager.ref;

        usager.ref = nextRef;
        if (`${previousRef}` === usager.customRef) {
          usager.customRef = `${nextRef}`;
        }
        nextRef++;
        console.log(
          `[Migration] "${this.name}": update usager _id "${usager._id}" ref from ${previousRef} to ${nextRef}`
        );
        await await usagerRepositoryForMigration.save(usager);
      } else {
        refs.push(dup.UsagerTable_ref);
      }
    }

    await queryRunner.query(
      `ALTER TABLE "usager" ADD CONSTRAINT "UQ_e76056fb098740de66d58a5055a" UNIQUE ("structureId", "ref")`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "usager" DROP CONSTRAINT "UQ_e76056fb098740de66d58a5055a"`
    );
  }
}
