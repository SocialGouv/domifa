import { MigrationInterface } from "typeorm";
import { domifaConfig } from "../config";
import { structureRepository } from "../database";
import { StructureSmsParams } from "@domifa/common";
import { appLogger } from "../util";

export class ManualMigration1755033531923 implements MigrationInterface {
  name: string = "ManualMigration1755033531923";
  public async up(): Promise<void> {
    const emailList = [];
    if (
      domifaConfig().envId === "prod" ||
      domifaConfig().envId === "preprod" ||
      domifaConfig().envId === "local"
    ) {
      appLogger.info("Starting migration: Updating structures SMS schedules");

      const structures = await structureRepository.find({
        select: {
          id: true,
          email: true,
          sms: true,
        },
      });

      const structuresWithoutSmsSchedule = structures.filter(
        (s) => !Object.values(s.sms?.schedule).some((value) => value === true)
      );

      // Process each structure record
      for (const structure of structuresWithoutSmsSchedule) {
        const smsParams: StructureSmsParams = {
          ...structure.sms,
          schedule: {
            ...structure.sms.schedule,
            tuesday: true,
            thursday: true,
          },
        };

        await structureRepository.update(
          {
            id: structure.id,
          },
          {
            sms: smsParams,
          }
        );

        emailList.push(structure.email);
      }
      appLogger.info("Migration end");
      appLogger.info("Liste des emails des structures à contacter:", emailList);
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
