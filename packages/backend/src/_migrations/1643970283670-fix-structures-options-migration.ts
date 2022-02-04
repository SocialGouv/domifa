import { MigrationInterface, QueryRunner } from "typeorm";

import { structureRepository } from "../database";

const emptyStructures = [
  794, 793, 782, 777, 801, 809, 797, 812, 784, 789, 783, 802, 811, 780, 788,
  799, 785, 790, 792, 798, 786, 781, 795, 779, 791, 796, 800, 804, 803, 808,
  806, 805, 778, 787, 810, 807,
];

export class manualMigration1643970283670 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const structuresWithEmptyOptions = await (
      await structureRepository.typeorm()
    ).query(`
            SELECT *
            FROM "structure"
            WHERE "options" is NULL
        `);

    for (const structure of structuresWithEmptyOptions) {
      await (
        await structureRepository.typeorm()
      ).update(
        {
          uuid: structure.uuid,
        },
        {
          options: { numeroBoite: false },
        }
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    for (const id of emptyStructures) {
      await (
        await structureRepository.typeorm()
      ).update(
        {
          id,
        },
        {
          options: null,
        }
      );
    }
  }
}
