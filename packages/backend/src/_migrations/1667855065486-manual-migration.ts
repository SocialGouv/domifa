import { structureCommonRepository } from "../database/services/structure/structureCommonRepository.service";
import { MigrationInterface, QueryRunner } from "typeorm";

export class manualMigration1667855065486 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const lastLoginArray: {
      structureId: number;
      lastLogin: Date;
    }[] = await queryRunner.query(
      `select "structureId", "lastLogin" from user_structure us where "lastLogin" is not null group by "structureId", "lastLogin" order by "lastLogin" desc`
    );

    console.log(lastLoginArray.length + " structures à mettre à jour");

    for (let i = 0; i < lastLoginArray.length; i++) {
      await structureCommonRepository.updateOne(
        { id: lastLoginArray[i].structureId },
        {
          lastLogin: lastLoginArray[i].lastLogin,
        }
      );
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
