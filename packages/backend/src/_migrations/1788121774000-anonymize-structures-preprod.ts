import { MigrationInterface, QueryRunner } from "typeorm";
import { fakerFR as faker } from "@faker-js/faker";
import {
  StructureAddresseCourrier,
  StructureResponsable,
  Telephone,
} from "@domifa/common";
import { domifaConfig } from "../config";
import { appLogger } from "../util";

type StructureRow = {
  uuid: string;
  id: number;
  complementAdresse: string | null;
  adresseCourrier: StructureAddresseCourrier | null;
  telephone: Telephone;
  responsable: StructureResponsable;
};

// Preprod only: replaces every structure's real-world data (name, address,
// contact details, manager) with faker values. Emails stay unique thanks to
// the structure id.
export class AnonymizeStructuresPreprod1788121774000
  implements MigrationInterface
{
  name = "AnonymizeStructuresPreprod1788121774000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    if (domifaConfig().envId !== "preprod") {
      return;
    }

    const rows: StructureRow[] = await queryRunner.query(
      `SELECT "uuid", "id", "complementAdresse", "adresseCourrier", "telephone", "responsable"
       FROM "structure" ORDER BY "id"`
    );

    await queryRunner.startTransaction();
    try {
      for (const row of rows) {
        const telephone: Telephone = {
          countryCode: row.telephone?.countryCode ?? "fr",
          numero: `0${faker.number.int({
            min: 1,
            max: 9,
          })}${faker.string.numeric(8)}`,
        };

        const responsable: StructureResponsable = {
          fonction: row.responsable?.fonction ?? "",
          nom: faker.person.lastName(),
          prenom: faker.person.firstName(),
        };

        const adresseCourrier: StructureAddresseCourrier | null =
          row.adresseCourrier
            ? {
                ...row.adresseCourrier,
                adresse: faker.location.streetAddress(),
                ville: faker.location.city(),
              }
            : null;

        await queryRunner.query(
          `UPDATE "structure"
           SET "nom" = $1,
               "adresse" = $2,
               "complementAdresse" = $3,
               "ville" = $4,
               "email" = $5,
               "telephone" = $6::jsonb,
               "responsable" = $7::jsonb,
               "adresseCourrier" = $8::jsonb
           WHERE "uuid" = $9`,
          [
            faker.company.name(),
            faker.location.streetAddress(),
            row.complementAdresse === null
              ? null
              : faker.location.secondaryAddress(),
            faker.location.city(),
            `structure-${row.id}@${faker.internet.domainName()}`,
            JSON.stringify(telephone),
            JSON.stringify(responsable),
            adresseCourrier === null ? null : JSON.stringify(adresseCourrier),
            row.uuid,
          ]
        );
      }
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    }

    appLogger.info(
      `[anonymize-structures] ${rows.length} structures anonymized on preprod`
    );
  }

  public async down(): Promise<void> {
    return;
  }
}
