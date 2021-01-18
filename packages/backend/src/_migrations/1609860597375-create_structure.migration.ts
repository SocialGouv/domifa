import { Model } from "mongoose";
import { MigrationInterface, QueryRunner } from "typeorm";
import { appHolder } from "../appHolder";
import { appTypeormManager, StructureTable } from "../database";
import { Structure } from "../structures/structure-interface";
import { appLogger } from "../util";

export class autoMigration1609860597375 implements MigrationInterface {
  name = "autoMigration1609860597375";

  public async up(queryRunner: QueryRunner): Promise<void> {
    appLogger.debug(`[Migration] UP "${this.name}"`);

    await queryRunner.query(
      `CREATE TABLE "structure" ("uuid" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "version" integer NOT NULL, "_id" text, "id" SERIAL NOT NULL, "adresse" text, "adresseCourrier" jsonb, "agrement" text, "capacite" integer, "codePostal" text, "complementAdresse" text, "departement" text, "region" text, "email" text, "hardReset" jsonb, "tokenDelete" text, "import" boolean NOT NULL DEFAULT false, "registrationDate" TIMESTAMP WITH TIME ZONE NOT NULL, "importDate" date, "lastExport" date, "lastLogin" date, "nom" text, "options" jsonb, "phone" text, "responsable" jsonb, "stats" jsonb NOT NULL, "structureType" text NOT NULL, "token" text, "verified" boolean NOT NULL DEFAULT false, "ville" text, CONSTRAINT "UQ_90ac7986e769d602d218075215c" UNIQUE ("id"), CONSTRAINT "PK_a92a6b3dd54efb4ab48b2d6e7c1" PRIMARY KEY ("uuid"))`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_90ac7986e769d602d218075215" ON "structure" ("id") `
    );
    const structureModel: Model<Structure> = appHolder.app.get(
      "STRUCTURE_MODEL"
    );
    const totalStructures: number = await structureModel.count({}).exec();

    while (
      (await this.migrateNextStructures({ queryRunner, totalStructures })) !== 0
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
      { migrated: true },
      { $set: { migrated: false } },
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
      .find({ migrated: { $ne: true } })
      .limit(100)
      .select("+hardReset +tokenDelete +stats")
      .exec();

    appLogger.debug(
      `[Migration] migrating ${mongoStructures.length} structures (total: ${totalStructures})`
    );

    const structureRepository = appTypeormManager.getRepository(
      StructureTable,
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
            ? ac
            : undefined;
        const hr = mongoStructure.hardReset;
        const hardReset = hr && (hr as any) !== {} ? hr : undefined;
        const structureToCreate: StructureTable = {
          _id: mongoStructure._id.toString(),
          id: mongoStructure.id,
          registrationDate: mongoStructure.createdAt,
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
          responsable: mongoStructure.responsable,
          hardReset,
          tokenDelete: mongoStructure.tokenDelete,
          adresseCourrier,
          lastExport: mongoStructure.lastExport,
          stats: mongoStructure.stats,
          options: {
            numeroBoite: mongoStructure.options.numeroBoite,
          },
          token: undefinedIfEmptyString(mongoStructure.token),
          verified: mongoStructure.verified,
        };

        await structureModel.findOneAndUpdate(
          { _id: structureToCreate._id },
          { $set: { migrated: true } }
        );

        await structureRepository.insert(structureToCreate);
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
