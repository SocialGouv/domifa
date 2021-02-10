import { Model } from "mongoose";
import { MigrationInterface, QueryRunner } from "typeorm";
import { appHolder } from "../appHolder";
import { appTypeormManager, structureRepository } from "../database";
import { _TMP_MIGRATION_StructureTable } from "../database/entities/structure/_TMP_MIGRATION_StructureTable.typeorm";
import { Structure } from "../structures/structure-interface";
import { appLogger } from "../util";

export class autoMigration1609860597375 implements MigrationInterface {
  name = "autoMigration1609860597375";

  // NOTE: repasser ça en prod + preprod, mais pas en test!

  public async up(queryRunner: QueryRunner): Promise<void> {
    appLogger.debug(`[Migration] UP "${this.name}"`);

    await queryRunner.query(
      `CREATE TABLE "structure" ("uuid" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "version" integer NOT NULL, "_id" text, "id" SERIAL NOT NULL, "mongoStructureId" integer, "adresse" text, "adresseCourrier" jsonb, "agrement" text, "capacite" integer, "codePostal" text, "complementAdresse" text, "departement" text, "region" text, "email" text, "hardReset" jsonb, "tokenDelete" text, "import" boolean NOT NULL DEFAULT false, "registrationDate" TIMESTAMP WITH TIME ZONE NOT NULL, "importDate" date, "lastExport" date, "lastLogin" date, "nom" text, "options" jsonb, "phone" text, "responsable" jsonb NOT NULL, "stats" jsonb NOT NULL, "structureType" text NOT NULL, "token" text, "verified" boolean NOT NULL DEFAULT false, "ville" text, CONSTRAINT "UQ_90ac7986e769d602d218075215c" UNIQUE ("id"), CONSTRAINT "UQ_870780802d799a6c16a6a86e40e" UNIQUE ("mongoStructureId"), CONSTRAINT "PK_a92a6b3dd54efb4ab48b2d6e7c1" PRIMARY KEY ("uuid"))`
    );

    await queryRunner.query(
      `CREATE INDEX "IDX_90ac7986e769d602d218075215" ON "structure" ("id") `
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_870780802d799a6c16a6a86e40" ON "structure" ("mongoStructureId") `
    );

    const structureModel: Model<Structure> = appHolder.app.get(
      "STRUCTURE_MODEL"
    );
    const totalStructures: number = await structureModel.count({}).exec();

    while (
      (await this.migrateNextStructures({ queryRunner, totalStructures })) !== 0
    );

    const maxStructureId = await structureRepository
      .getForMigration(queryRunner.manager)
      .max({
        maxAttribute: "id",
      });

    await queryRunner.query(
      `ALTER SEQUENCE structure_id_seq RESTART WITH ${maxStructureId + 1};`
    );

    appLogger.debug(
      `[Migration] [SUCCESS] "${this.name}" StructureTable migrated totally`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_90ac7986e769d602d218075215"`);
    await queryRunner.query(`DROP TABLE "structure"`);

    const structureModel: Model<Structure> = appHolder.app.get(
      "STRUCTURE_MODEL"
    );
    await structureModel.updateMany(
      { migratedProdFix: true },
      { $set: { migratedProdFix: false } },
      { multi: true }
    );
  }

  private async migrateNextStructures({
    queryRunner,
    totalStructures,
  }: {
    queryRunner: QueryRunner;
    totalStructures: number;
  }): Promise<number> {
    appLogger.debug(`[Migration] getNextStructures`);

    const structureModel: Model<Structure> = appHolder.app.get(
      "STRUCTURE_MODEL"
    );
    const mongoStructures: Structure[] = await structureModel
      .find({ migratedProdFix: { $ne: true } })
      .limit(100)
      .select("+hardReset +tokenDelete +stats")
      .exec();

    appLogger.debug(
      `[Migration] migrating ${mongoStructures.length} structures (total: ${totalStructures})`
    );

    const structureRepository = appTypeormManager.getRepository(
      _TMP_MIGRATION_StructureTable,
      queryRunner.manager
    );

    if (mongoStructures && mongoStructures !== null && mongoStructures.length) {
      for (const mongoStructure of mongoStructures) {
        const ac = mongoStructure.adresseCourrier;
        const adresseCourrier =
          ac &&
          (ac.actif !== false ||
            ac.adresse.trim().length ||
            ac.codePostal.trim().length ||
            ac.ville.trim().length)
            ? JSON.parse(JSON.stringify(ac))
            : undefined;
        const hr = mongoStructure.hardReset;
        const hardReset =
          hr && (hr as any) !== {} ? JSON.parse(JSON.stringify(hr)) : undefined;

        const structureToCreate: _TMP_MIGRATION_StructureTable = {
          _id: mongoStructure._id.toString(),
          id: mongoStructure.id,
          mongoStructureId: mongoStructure.id,
          registrationDate: mongoStructure.createdAt
            ? mongoStructure.createdAt
            : new Date(),
          createdAt: mongoStructure["createdAt"],
          updatedAt: mongoStructure["updatedAt"],
          adresse: undefinedIfEmptyString(mongoStructure.adresse),
          complementAdresse: undefinedIfEmptyString(
            mongoStructure.complementAdresse
          ),
          nom: undefinedIfEmptyString(mongoStructure.nom),
          structureType: mongoStructure.structureType,
          ville: undefinedIfEmptyString(mongoStructure.ville),
          departement: undefinedIfEmptyString(mongoStructure.departement),
          region: undefinedIfEmptyString(mongoStructure.region),
          capacite: mongoStructure.capacite,
          codePostal: undefinedIfEmptyString(mongoStructure.codePostal),
          agrement: undefinedIfEmptyString(mongoStructure.agrement),
          phone: undefinedIfEmptyString(mongoStructure.phone),
          email: undefinedIfEmptyString(mongoStructure.email),
          import: mongoStructure.import,
          importDate: mongoStructure.importDate,
          lastLogin: mongoStructure.lastLogin,
          responsable: JSON.parse(JSON.stringify(mongoStructure.responsable)),
          hardReset,
          tokenDelete: mongoStructure.tokenDelete,
          adresseCourrier,
          lastExport: mongoStructure.lastExport,
          stats: JSON.parse(JSON.stringify(mongoStructure.stats)),
          options: {
            numeroBoite: mongoStructure.options.numeroBoite,
          },
          token: undefinedIfEmptyString(mongoStructure.token),
          verified: mongoStructure.verified,
        };

        await structureModel.findOneAndUpdate(
          { _id: structureToCreate._id },
          { $set: { migratedProdFix: true } }
        );

        const x = await structureRepository.save(
          new _TMP_MIGRATION_StructureTable(structureToCreate)
        );
      }
      return mongoStructures.length;
    }
    return 0;
  }
}

function undefinedIfEmptyString(str: string) {
  if (str && str.trim().length) {
    return str.trim();
  }
  return undefined;
}
