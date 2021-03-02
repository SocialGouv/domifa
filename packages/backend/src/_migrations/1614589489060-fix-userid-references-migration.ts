import { Model } from "mongoose";
import { MigrationInterface, QueryRunner } from "typeorm";
import { appHolder } from "../appHolder";
import { interactionRepository, usersRepository } from "../database";
import { User } from "../users/user.interface";
import { appLogger } from "../util";

export class manualMigration1614589489060 implements MigrationInterface {
  name = "manualMigration1614589489060";

  public async up(queryRunner: QueryRunner): Promise<void> {
    appLogger.debug(`[Migration] UP "${this.name}"`);

    const pgUsers = await usersRepository.findManyWithQuery<any>({
      where: "_id is not null",
      select: ["_id", "id", "structureId"],
      order: {
        id: "ASC",
      },
    });
    appLogger.debug(`[Migration] UP ${pgUsers.length} pgUsers to check`);
    const userModel: Model<User> = appHolder.app.get("USER_MODEL");

    let i = 0;
    for (const pgUser of pgUsers) {
      const mongoUser = await userModel.findOne({
        _id: pgUser._id,
      });
      if (!mongoUser) {
        appLogger.error(
          `[Migration] MONGO user not found with _id "${pgUser._id}"`
        );
        continue;
      }
      const newUserId = pgUser.id;
      const oldUserId = mongoUser.id;
      i++;
      if (i !== 0 && i % 100 === 0) {
        appLogger.debug(
          `[Migration] "${this.name}" ${i}/${pgUsers.length} users processed`
        );
      }
      if (oldUserId === newUserId) {
        continue;
      }
      // appLogger.debug(
      //   `[Migration] MONGO user id "${oldUserId}" does not match PG user "${newUserId}" (_id=${mongoUser._id})`
      // );
      if (pgUser.structureId !== mongoUser.structureId) {
        appLogger.debug(
          `[Migration] MONGO user structureId "${mongoUser.structureId}" does not match PG structureId "${pgUser.structureId}" (_id=${mongoUser._id})`
        );
        throw new Error(`Invalid script ${this.name} or currupted data`);
      }
      // console.log(
      //   `update interactions set "userId" = ${newUserId} where "userId" = ${oldUserId} and "createdAt" < '2020-12-09 10:16:00z'::timestamptz;`
      // );
      await (
        await interactionRepository.typeorm()
      ).query(
        `update interactions set "userId" = $1 where "userId" = $2 and not exists (select 1 from app_user where interactions."userId" = app_user.id and interactions."structureId" = app_user."structureId");`,
        [newUserId, oldUserId]
      );

      await (
        await interactionRepository.typeorm()
      ).query(
        `update usager set "decision" = "decision" || ('{"userId": ' || $1 || '}')::jsonb  where (usager.decision->>'userId')::integer = $2 AND not exists (select 1 from app_user where (usager.decision->>'userId')::integer = app_user.id and usager."structureId" = app_user."structureId")`,
        [newUserId, oldUserId]
      );
      await (
        await interactionRepository.typeorm()
      ).query(
        `update usager set "rdv" = "rdv" || ('{"userId": ' || $1 || '}')::jsonb  where (usager.rdv->>'userId')::integer = $2 AND not exists (select 1 from app_user where (usager.rdv->>'userId')::integer = app_user.id and usager."structureId" = app_user."structureId")`,
        [newUserId, oldUserId]
      );
    }
    appLogger.debug(
      `[Migration] "${this.name}" remove deleted users interactions.userId`
    );

    await queryRunner.query(
      `ALTER TABLE "interactions" ALTER COLUMN "userId" DROP NOT NULL`
    );
    console.log(`[Migration] "${this.name}" CLEAR interactions (1/3)`);
    await queryRunner.query(
      `UPDATE interactions i set "userId" = null where not exists (select 1 from app_user where i."userId" = app_user.id and i."structureId" = app_user."structureId" and lower(i."userName") =  lower((app_user.prenom || ' ' || app_user.nom)) or lower(i."userName") = lower((app_user.nom || ' ' || app_user.prenom)));`
    );
    console.log(`[Migration] "${this.name}" CLEAR usager (2/3)`);
    await queryRunner.query(
      `update usager set "decision" = "decision" || '{"userId": null}'::jsonb where not exists (select 1 from app_user where (usager.decision->>'userId')::integer = app_user.id and usager."structureId" = app_user."structureId");`
    );
    console.log(`[Migration] "${this.name}" CLEAR usager (3/3)`);
    await queryRunner.query(
      `update usager set "rdv" = "rdv" || '{"userId": null}'::jsonb where not exists (select 1 from app_user where (usager.rdv->>'userId')::integer = app_user.id and usager."structureId" = app_user."structureId");`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "interactions" ALTER COLUMN "userId" SET NOT NULL`
    );
  }
}
