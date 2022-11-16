import { structureCommonRepository } from "../database/services/structure/structureCommonRepository.service";
import { MigrationInterface, QueryRunner } from "typeorm";

export class manualMigration1667855065490 implements MigrationInterface {
  name = "updateLastLoginMigration1667855065490";
  public async up(queryRunner: QueryRunner): Promise<void> {
    const lastLoginArray: {
      structureId: number;
      first_value: Date;
    }[] = await queryRunner.query(
      `select DISTINCT  first_value("lastLogin") OVER (PARTITION BY "structureId" ORDER BY "lastLogin" DESC),  "structureId" FROM user_structure where "lastLogin" is not null ORDER BY 1`
    );

    console.log(lastLoginArray.length + " structures à mettre à jour");

    for (let i = 0; i < lastLoginArray.length; i++) {
      await structureCommonRepository.updateOne(
        { id: lastLoginArray[i].structureId },
        {
          lastLogin: new Date(lastLoginArray[i].first_value),
        }
      );
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
