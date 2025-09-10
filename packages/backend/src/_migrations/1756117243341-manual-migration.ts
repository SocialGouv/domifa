import { MessageSms } from "@domifa/common";
import { MigrationInterface, QueryRunner } from "typeorm";
import { messageSmsRepository } from "../database";
import { appLogger, getPhoneString } from "../util";
import { domifaConfig } from "../config";
import { PhoneNumberFormat } from "google-libphonenumber";

export class ManualMigration1756117243341 implements MigrationInterface {
  name = "CreateSmsForUserUsager1756117243341";

  public async up(queryRunner: QueryRunner): Promise<void> {
    if (domifaConfig().envId === "prod") {
      appLogger.warn(
        "Début de la migration : Création des SMS pour les comptes usagers"
      );

      // Récupération de tous les user_usager avec les informations nécessaires via jointure
      const userUsagers = await queryRunner.query(`
      SELECT
        uu.id,
        uu."usagerUUID",
        uu."structureId",
        uu.login,
        u.ref as "usagerRef",
        u.telephone,
        u."dateNaissance"
      FROM user_usager uu
      INNER JOIN usager u ON uu."usagerUUID" = u.uuid
      WHERE  u.telephone IS NOT NULL
        AND (u.options ->> 'portailUsagerEnabled')::boolean = true
        AND u."structureId" = 2165
        AND (u.telephone->>'numero') IS NOT NULL
        AND (u.telephone->>'numero') != ''
    `);

      appLogger.warn(`Nombre d'utilisateurs trouvés : ${userUsagers.length}`);

      const smsToSave: MessageSms[] = [];
      const scheduledDate = new Date();

      for (const userUsager of userUsagers) {
        const { login, telephone, usagerRef, structureId } = userUsager;

        const phoneNumber = telephone?.numero || "";

        if (!phoneNumber) {
          appLogger.warn(
            `Numéro de téléphone manquant pour l'usager ${userUsager.usagerUUID}`
          );
          continue;
        }

        const smsContent = `Nouveau site Inserasaf pour consulter votre courrier !
ID: ${login}
Mot de passe: date de naissance (ex: 01011952)
Lien: https://urlr.me/JCdwYs
DomiFa`;

        smsToSave.push({
          usagerRef: usagerRef,
          structureId: structureId,
          content: smsContent,
          senderName: "INSERASAF",
          status: "TO_SEND",
          smsId: "idMonDomiFa",
          phoneNumber: getPhoneString(
            userUsager.telephone,
            PhoneNumberFormat.E164
          ),
          scheduledDate,
          errorCount: 0,
        });
      }

      if (smsToSave?.length > 0) {
        await messageSmsRepository.save(smsToSave);
        appLogger.warn(`Migration terminée : ${smsToSave.length} SMS créés`);
      } else {
        appLogger.warn("Aucun SMS à créer");
      }
    }
  }

  public async down(): Promise<void> {
    appLogger.warn(
      "Début du rollback : Suppression des SMS de création de compte"
    );
  }
}
