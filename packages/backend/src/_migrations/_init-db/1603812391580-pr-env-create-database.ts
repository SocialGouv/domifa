import { MigrationInterface, QueryRunner } from "typeorm";
import { readFile } from "fs/promises";
import { resolve } from "path";
import { domifaConfig } from "../../config";
import { appLogger } from "../../util";

export class CreateDatabase1603812391580 implements MigrationInterface {
  name = "createDatabaseMigration1603812391580";

  public async up(queryRunner: QueryRunner): Promise<void> {
    if (domifaConfig().envId === "prod" || domifaConfig().envId === "preprod") {
      return;
    }

    // Créer la table migrations en premier si elle n'existe pas
    await this.ensureMigrationsTable(queryRunner);

    // Vérifier si la DB est déjà initialisée en comptant les autres tables
    const isDbInitialized = await this.isDatabaseInitialized(queryRunner);
    if (isDbInitialized) {
      appLogger.warn(
        "La base de données semble déjà initialisée, création annulée."
      );
      return;
    }

    appLogger.warn("Lancement de la création de la DB");

    await this.loadAndExecuteDump(queryRunner);

    appLogger.warn("Création de la DB réussi");
  }

  private async ensureMigrationsTable(queryRunner: QueryRunner): Promise<void> {
    const tableExists = await queryRunner.hasTable("migrations");

    if (!tableExists) {
      appLogger.warn("Création de la table migrations pour TypeORM");

      await queryRunner.query(`
          CREATE TABLE public."migrations" (
            "id" SERIAL NOT NULL,
            "timestamp" bigint NOT NULL,
            "name" character varying NOT NULL,
            CONSTRAINT "PK_8c82d7f526340ab734260ea46be" PRIMARY KEY ("id")
          )
        `);
    }
  }

  private async isDatabaseInitialized(
    queryRunner: QueryRunner
  ): Promise<boolean> {
    // Vérifier l'existence d'une table métier caractéristique de votre app
    // Remplacez "usagers" par une table importante de votre domaine
    const hasBusinessTables = await queryRunner.hasTable("usagers");
    return hasBusinessTables;
  }

  private async loadAndExecuteDump(queryRunner: QueryRunner): Promise<void> {
    try {
      const fileContent = await readFile(
        resolve(__dirname, "./domifa_test_schema.sql"),
        "utf8"
      );

      appLogger.warn("Exécution du dump PostgreSQL");
      await queryRunner.query(fileContent);

      appLogger.warn("Dump SQL exécuté avec succès");
    } catch (error) {
      appLogger.error("Erreur lors du chargement du dump SQL:", error);
      throw error;
    }
  }

  public async down(): Promise<void> {
    // pas nécessaire de maintenir le down ici
  }
}
