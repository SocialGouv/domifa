import { UsagerPG } from "./../database/entities/usager/UsagerPG.type";

import {
  interactionRepository,
  structureStatsRepository,
  usagerRepository,
  usersRepository,
} from "../database";
import * as fs from "fs-extra";
import { MigrationInterface, QueryRunner } from "typeorm";
import { appLogger } from "../util";
import path = require("path");
import { domifaConfig } from "../config";

export class manualMigration1620015603536 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    appLogger.debug(`[Migration] UP manualMigration1618928713316`);

    appLogger.debug(`[Migration] RUN migration Users`);

    const filesA = path.resolve(domifaConfig().upload.basePath + "159");

    const filesB = path.resolve(domifaConfig().upload.basePath + "291");

    let startNbFoldersA = 0;
    let startNbFoldersB = 0;

    fs.readdir(filesA, (err, files) => {
      startNbFoldersA = files.length;
    });

    fs.readdir(filesB, (err, files) => {
      startNbFoldersB = files.length;
    });

    const startNbUsagersA: number = await usagerRepository.count({
      where: { structureId: 159 },
    });

    const startNbUsagersB: number = await usagerRepository.count({
      where: { structureId: 291 },
    });

    const startNbInteractionsA: number = await interactionRepository.count({
      where: { structureId: 159 },
    });

    const startNbInteractionsB: number = await interactionRepository.count({
      where: { structureId: 291 },
    });

    const startNbUsersA: number = await usersRepository.count({
      where: { structureId: 159 },
    });

    const startNbUsersB: number = await usersRepository.count({
      where: { structureId: 291 },
    });

    const startNbStatsA: number = await structureStatsRepository.count({
      where: { structureId: 159 },
    });

    const startNbStatsB: number = await structureStatsRepository.count({
      where: { structureId: 291 },
    });

    const usagers: Pick<
      UsagerPG,
      "ref" | "uuid"
    >[] = await usagerRepository.findMany(
      { structureId: 159 },
      {
        select: ["uuid", "ref"],
        order: { ref: "ASC" },
      }
    );

    for (const usager of usagers) {
      const newRef = 3000 + usager.ref;

      await this.moveFolder(usager.ref, newRef);

      appLogger.debug(
        `[MIGRATE USAGER] OLD REF: ${usager.ref}  \t\t NEW REF: ${newRef}`
      );

      const newUsager: UsagerPG = await usagerRepository.updateOne(
        {
          uuid: usager.uuid,
          structureId: 159,
        },
        {
          ref: newRef,
          structureId: 291,
        }
      );

      await interactionRepository.updateMany(
        {
          usagerRef: usager.ref,
          structureId: 159,
        },
        {
          usagerRef: newRef,
          structureId: 291,
        }
      );
    }

    await usersRepository.updateMany(
      {
        structureId: 159,
      },
      {
        structureId: 291,
      }
    );

    await structureStatsRepository.deleteByCriteria({
      structureId: 159,
    });

    const afterNbUsagersA: number = await usagerRepository.count({
      where: { structureId: 159 },
    });

    const afterNbUsagersB: number = await usagerRepository.count({
      where: { structureId: 291 },
    });

    const afterNbInteractionsA: number = await interactionRepository.count({
      where: { structureId: 159 },
    });

    const afterNbInteractionsB: number = await interactionRepository.count({
      where: { structureId: 291 },
    });

    const afterNbUsersA: number = await usersRepository.count({
      where: { structureId: 159 },
    });

    const afterNbUsersB: number = await usersRepository.count({
      where: { structureId: 291 },
    });

    const afterNbStatsA: number = await structureStatsRepository.count({
      where: { structureId: 159 },
    });

    const afterNbStatsB: number = await structureStatsRepository.count({
      where: { structureId: 291 },
    });

    let endNbFoldersA = 0;
    let endNbFoldersB = 0;

    fs.readdir(filesA, (err, files) => {
      endNbFoldersA = files.length;
    });

    fs.readdir(filesB, (err, files) => {
      endNbFoldersB = files.length;
    });

    appLogger.debug(``);
    appLogger.debug(`[START OF MIGRATE USAGER] --------------`);
    appLogger.warn(
      `[FILES] A (159) : ${startNbFoldersA}  \t\t B (291) : ${startNbFoldersB}`
    );
    appLogger.warn(
      `[STATS] A (159) : ${startNbStatsA}  \t\t B (291) : ${startNbStatsB}`
    );

    appLogger.warn(
      `[USERS] A (159) : ${startNbUsersA}  \t\t B (291) : ${startNbUsersB}`
    );

    appLogger.warn(
      `[USAGERS] A (159) : ${startNbUsagersA}  \t B (291) : ${startNbUsagersB}`
    );

    appLogger.warn(
      `[INTERACTIONS] A (159) : ${startNbInteractionsA}  \t B (291) : ${startNbInteractionsB}`
    );

    appLogger.debug(``);

    appLogger.debug(`[END OF MIGRATE USAGER] --------------`);
    appLogger.warn(
      `[FILES] A (159) : ${endNbFoldersA}  \t\t B (291) : ${endNbFoldersB}`
    );
    appLogger.warn(
      `[STATS] A (159) : ${afterNbStatsA}  \t\t B (291) : ${afterNbStatsB}`
    );

    appLogger.warn(
      `[USERS] A (159) : ${afterNbUsersA}  \t\t B (291) : ${afterNbUsersB}`
    );

    appLogger.warn(
      `[USAGERS] A (159) : ${afterNbUsagersA}  \t B (291) : ${afterNbUsagersB}`
    );

    appLogger.warn(
      `[INTERACTIONS] A (159) : ${afterNbInteractionsA}  \t B (291) : ${afterNbInteractionsB}`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}

  // With async/await:
  public async moveFolder(acualRef: number, newRef: number) {
    const src = path.resolve(
      domifaConfig().upload.basePath + "159/" + acualRef
    );

    if (fs.existsSync(src)) {
      appLogger.debug(`[MOVE FILES] ${src}`);
      const dest = path.resolve(
        domifaConfig().upload.basePath + "291/" + newRef
      );

      try {
        await fs.move(src, dest);
        appLogger.debug(`[MOVE FILES] Move files for ${acualRef} OK`);
      } catch (err) {
        appLogger.error(`[MOVE FILES] Move files for ${acualRef} FAIL`);
      }
    }
  }
}
