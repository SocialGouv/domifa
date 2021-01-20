import { Model } from "mongoose";
import { MigrationInterface, QueryRunner } from "typeorm";
import { appHolder } from "../appHolder";
import { appTypeormManager, AppUserTable } from "../database";
import { User } from "../users/user.interface";
import { appLogger } from "../util";

// tslint:disable-next-line: class-name
export class autoMigration1604995302358 implements MigrationInterface {
  name = "autoMigration1604995302358";

  public async up(queryRunner: QueryRunner): Promise<void> {
    appLogger.debug(`[Migration] UP "${this.name}"`);
    await queryRunner.query(
      `CREATE TABLE "app_user" ("uuid" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "version" integer NOT NULL, "_id" text, "email" text NOT NULL, "fonction" text, "id" SERIAL NOT NULL, "lastLogin" TIMESTAMP WITH TIME ZONE, "nom" text NOT NULL, "password" text NOT NULL, "prenom" text NOT NULL, "role" text NOT NULL DEFAULT 'simple', "structureId" integer NOT NULL, "temporaryTokens" jsonb, "mails" jsonb NOT NULL DEFAULT '{"guide": false, "import": false}', "passwordLastUpdate" TIMESTAMP WITH TIME ZONE, "verified" boolean NOT NULL DEFAULT false, CONSTRAINT "UQ_b3109212e51e21b8acd695f7dab" UNIQUE ("_id"), CONSTRAINT "UQ_3fa909d0e37c531ebc237703391" UNIQUE ("email"), CONSTRAINT "UQ_22a5c4a3d9b2fb8e4e73fc4ada1" UNIQUE ("id"), CONSTRAINT "PK_a58dc229068f494a0360b170322" PRIMARY KEY ("uuid"))`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_3fa909d0e37c531ebc23770339" ON "app_user" ("email") `
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_22a5c4a3d9b2fb8e4e73fc4ada" ON "app_user" ("id") `
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_64204d3f209764ef8d08f334bd" ON "app_user" ("structureId") `
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_32881a91eaf51f28d3f9cf0958" ON "structure_stats" ("structureId") `
    );

    const itemsModel: Model<User> = appHolder.app.get("USER_MODEL");
    const items = await itemsModel.find({}).lean().exec();

    appLogger.warn(
      `[Migration] "${this.name}" ${items.length} users to migrate`
    );

    const itemsToCreateCache = items.map(
      (item) =>
        new AppUserTable({
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
          _id: item._id.toString(),
          id: (item as any).id,
          prenom: item.prenom,
          nom: item.nom,
          fonction: item.fonction,
          structureId: item.structureId,
          lastLogin: item.lastLogin,
          passwordLastUpdate: item.passwordLastUpdate,
          mails: (item as any).mails,
          email: item.email,
          password: item.password,
          verified: item.verified,
          role: item.role,
          temporaryTokens:
            item.tokens && item.tokens.password && item.tokens.password.length
              ? item.tokens
              : null,
        })
    );

    const createdCount = itemsToCreateCache.length;

    const appUserRepository = appTypeormManager.getRepository(
      AppUserTable,
      queryRunner.manager
    );

    for (const pgStat of itemsToCreateCache) {
      await appUserRepository.insert(pgStat);
    }

    appLogger.debug(
      `[Migration] [SUCCESS] "${
        this.name
      }" ${createdCount} AppUserTable created (${
        items.length - createdCount
      } ignored)`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_32881a91eaf51f28d3f9cf0958"`);
    await queryRunner.query(`DROP INDEX "IDX_64204d3f209764ef8d08f334bd"`);
    await queryRunner.query(`DROP INDEX "IDX_22a5c4a3d9b2fb8e4e73fc4ada"`);
    await queryRunner.query(`DROP INDEX "IDX_3fa909d0e37c531ebc23770339"`);
    await queryRunner.query(`DROP TABLE "app_user"`);
  }
}
