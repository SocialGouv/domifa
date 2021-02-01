import { Model } from "mongoose";
import { MigrationInterface, QueryRunner } from "typeorm";
import { appHolder } from "../appHolder";
import { domifaConfig } from "../config";
import { appTypeormManager, UsagerSexe, UsagerTable } from "../database";
import { UsagerAyantDroit } from "../database/entities/usager/UsagerAyantDroit.type";
import { UsagerDecision } from "../database/entities/usager/UsagerDecision.type";
import { UsagerDoc } from "../database/entities/usager/UsagerDoc.type";
import { UsagerTypeDom } from "../database/entities/usager/UsagerTypeDom.type";
import { Usager } from "../usagers/interfaces/usagers";
import { appLogger } from "../util";

export class autoMigration1611568677140 implements MigrationInterface {
  name = "autoMigration1611568677140";

  public async up(queryRunner: QueryRunner): Promise<void> {
    appLogger.debug(
      `[Migration] UP "${this.name}" (env:${domifaConfig().envId})`
    );

    await queryRunner.query(
      `CREATE TABLE "usager" ("uuid" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "version" integer NOT NULL, "_id" text, "ref" integer NOT NULL, "customRef" text NOT NULL, "structureId" integer NOT NULL, "nom" text NOT NULL, "prenom" text NOT NULL, "surnom" text, "sexe" text NOT NULL, "dateNaissance" TIMESTAMP WITH TIME ZONE NOT NULL, "villeNaissance" text NOT NULL, "langue" text, "email" text, "phone" text, "preference" jsonb DEFAULT '{"email": false, "phone": false}', "datePremiereDom" TIMESTAMP WITH TIME ZONE, "typeDom" text DEFAULT 'INSTRUCTION', "decision" jsonb NOT NULL, "historique" jsonb NOT NULL, "ayantsDroits" jsonb, "lastInteraction" jsonb NOT NULL, "docs" jsonb NOT NULL DEFAULT '[]', "docsPath" jsonb NOT NULL DEFAULT '[]', "etapeDemande" integer NOT NULL DEFAULT 0, "rdv" jsonb, "entretien" jsonb NOT NULL, "options" jsonb NOT NULL, CONSTRAINT "PK_1bb36e24229bec446a281573612" PRIMARY KEY ("uuid"))`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_a44d882d224e368efdee8eb8c8" ON "usager" ("structureId") `
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_8198a25ae40584a38bce1dd4d2" ON "usager" ("ref") `
    );
    const usagerModel: Model<Usager> = appHolder.app.get("USAGER_MODEL");
    const totalUsagers: number = await usagerModel
      .count({
        $or: [{ migrated: false }, { migrated: { $exists: false } }],
      })
      .exec();

    let currentCount = 0;
    do {
      currentCount += await this.migrateNextUsagers({
        queryRunner,
        currentCount,
        totalUsagers,
      });
    } while (currentCount < totalUsagers);

    await queryRunner.query(
      `delete FROM usager i where not exists (select 1 from "structure" s where i."structureId" = s.id ); `
    );
    await queryRunner.query(
      `UPDATE usager SET "decision"=jsonb_set("decision", '{motif}', 'null') where decision->>'motif' = '';`
    );
    await queryRunner.query(
      `update usager set "typeDom" ='RENOUVELLEMENT' where "typeDom" ='renouvellement';`
    );
    await queryRunner.query(
      `update usager set "typeDom" ='PREMIERE' where "typeDom" ='premiere' or "typeDom" = 'Premiere';`
    );

    await queryRunner.query(
      `ALTER TABLE "usager" ADD CONSTRAINT "FK_a44d882d224e368efdee8eb8c80" FOREIGN KEY ("structureId") REFERENCES "structure"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    appLogger.debug(
      `[Migration] [SUCCESS] "${this.name}" UsagerTable migrated totally`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "usager" DROP CONSTRAINT "FK_a44d882d224e368efdee8eb8c80"`
    );
    await queryRunner.query(`DROP INDEX "IDX_a44d882d224e368efdee8eb8c8"`);
    await queryRunner.query(`DROP INDEX "IDX_8198a25ae40584a38bce1dd4d2"`);
    await queryRunner.query(`DROP TABLE "usager"`);
    const usagerModel: Model<Usager> = appHolder.app.get("USAGER_MODEL");
    await usagerModel.updateMany(
      { migrated: true },
      { $set: { migrated: false } },
      { multi: true }
    );
  }

  private async migrateNextUsagers({
    queryRunner,
    totalUsagers,
    currentCount,
  }: {
    queryRunner: QueryRunner;
    totalUsagers: number;
    currentCount: number;
  }): Promise<number> {
    appLogger.debug(`[Migration] migrateNextUsagers`);

    const usagerModel: Model<Usager> = appHolder.app.get("USAGER_MODEL");
    const mongoUsagers: Usager[] = await usagerModel
      .find({ migrated: { $ne: true } })
      .limit(1000)
      .exec();

    appLogger.debug(
      `[Migration] migrating ${mongoUsagers.length} usagers (${currentCount}/${totalUsagers})`
    );

    const usagerRepository = appTypeormManager.getRepository(
      UsagerTable,
      queryRunner.manager
    );

    if (mongoUsagers && mongoUsagers !== null && mongoUsagers.length) {
      for (const mongoUsager of mongoUsagers) {
        const decision = mongoUsager.decision
          ? (mongoUsager.decision as UsagerDecision)
          : domifaConfig().envId === "test"
          ? ({
              dateDecision: new Date(),
              statut: "VALIDE",
              dateDebut: new Date(),
              motif: "A_SA_DEMANDE",
              typeDom: "PREMIERE",
              orientation: "asso",
            } as UsagerDecision)
          : undefined;

        const usagerToCreate: UsagerTable = {
          _id: mongoUsager._id.toString(),
          createdAt: mongoUsager["createdAt"],
          updatedAt: mongoUsager["updatedAt"],
          ref: mongoUsager.id,
          customRef: mongoUsager.customId
            ? mongoUsager.customId
            : `${mongoUsager.id}`,
          structureId: mongoUsager.structureId,
          nom: mongoUsager.nom,
          prenom: mongoUsager.prenom,
          surnom: undefinedIfEmptyString(mongoUsager.surnom),
          sexe: mongoUsager.sexe as UsagerSexe,
          dateNaissance: mongoUsager.dateNaissance,
          villeNaissance: undefinedIfEmptyString(mongoUsager.villeNaissance),
          langue: undefinedIfEmptyString(mongoUsager.langue),
          email: undefinedIfEmptyString(mongoUsager.email),
          phone: undefinedIfEmptyString(mongoUsager.phone),
          preference: mongoUsager.preference,
          datePremiereDom: mongoUsager.datePremiereDom,
          typeDom: mongoUsager.typeDom as UsagerTypeDom,
          decision,
          historique: mongoUsager.historique as UsagerDecision[],
          ayantsDroits: mongoUsager.ayantsDroits as UsagerAyantDroit[],
          lastInteraction: mongoUsager.lastInteraction,
          docs: mongoUsager.docs as UsagerDoc[],
          docsPath: mongoUsager.docsPath,
          etapeDemande: mongoUsager.etapeDemande,
          rdv: mongoUsager.rdv
            ? {
                userId: parseInt(mongoUsager.rdv.userId, 10),
                dateRdv: mongoUsager.rdv.dateRdv,
                userName: mongoUsager.rdv.userName,
              }
            : undefined,
          entretien: mongoUsager.entretien,
          options: mongoUsager.options,
        };

        await usagerModel.findOneAndUpdate(
          { _id: usagerToCreate._id },
          { $set: { migrated: true } }
        );

        await usagerRepository.insert(usagerToCreate);
      }
      return mongoUsagers.length;
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
