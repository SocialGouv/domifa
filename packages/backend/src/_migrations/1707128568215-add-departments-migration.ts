/* eslint-disable @typescript-eslint/no-unused-vars */
import { MigrationInterface, QueryRunner } from "typeorm";
import { structureRepository } from "../database";
import { DEPARTEMENTS_MAP } from "@domifa/common";
import { domifaConfig } from "../config";

export class ManualMigration1707128568215 implements MigrationInterface {
  public async up(_queryRunner: QueryRunner): Promise<void> {
    if (
      domifaConfig().envId === "prod" ||
      domifaConfig().envId === "preprod" ||
      domifaConfig().envId === "local"
    ) {
      for (const departmentCode of Object.keys(DEPARTEMENTS_MAP)) {
        console.log("Update structures for department: " + departmentCode);
        await structureRepository.update(
          {
            departement: departmentCode,
          },
          {
            departmentName: DEPARTEMENTS_MAP[departmentCode].departmentName,
            regionName: DEPARTEMENTS_MAP[departmentCode].regionName,
          }
        );
      }
    }
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {
    //
  }
}