import { MigrationInterface, QueryRunner } from "typeorm";
import { domifaConfig } from "../config";

export class BackfillAppLogUserType1779316279014 implements MigrationInterface {
  name = "BackfillAppLogUserType1779316279014";

  public async up(queryRunner: QueryRunner): Promise<void> {
    if (
      domifaConfig().envId !== "prod" &&
      domifaConfig().envId !== "preprod" &&
      domifaConfig().envId !== "local"
    ) {
      return;
    }

    await queryRunner.query(
      `UPDATE app_log SET "userType" = 'user_structure'
       WHERE "userType" IS NULL AND action IN (
         'STRUCTURE_UPDATE','USAGERS_DELETE','USAGER_DELETE',
         'USAGERS_DOCS_UPLOAD','USAGERS_DOCS_DOWNLOAD','USAGERS_DOCS_DELETE',
         'USAGERS_DOCS_RENAME','USAGERS_DOCS_SHARED',
         'USAGERS_EMAIL_DELETE','USAGERS_EMAIL_UPDATE',
         'USAGERS_PHONE_DELETE','USAGERS_PHONE_UPDATE',
         'MON_DOMIFA_CREATE_PORTAIL_ACCOUNT_BULK',
         'EXPORT_USAGERS','GET_STATS','EXPORT_STATS',
         'IMPORT_USAGERS_SUCCESS','IMPORT_USAGERS_PREVIEW','IMPORT_USAGERS_FAILED',
         'IMPORT_TEMPLATE_DOWNLOAD','IMPORT_DOWNLOAD_GUIDE',
         'SMS_SETTINGS_UPDATE','ENABLE_SMS_BY_STRUCTURE','DISABLE_SMS_BY_STRUCTURE',
         'ENABLE_PORTAIL_BY_STRUCTURE','DISABLE_PORTAIL_BY_STRUCTURE',
         'RESET_PASSWORD_PORTAIL','DOWNLOAD_PASSWORD_PORTAIL',
         'DELETE_NOTE','SUPPRIMER_PIECE_JOINTE',
         'USER_DELETE','USER_ROLE_CHANGE',
         'REACTIVATION_ACCOUNT','REACTIVATION_STRUCTURE'
       )`
    );

    await queryRunner.query(
      `UPDATE app_log SET "userType" = 'user_supervisor'
       WHERE "userType" IS NULL AND action IN (
         'EXPORT_STATS_FROM_ADMIN','EXPORT_DOMIFA',
         'GET_STATS_PORTAIL_ADMIN','GET_STATS_PORTAIL_ADMIN_DENIED',
         'ADMIN_CREATE_USER_STRUCTURE','ADMIN_CREATE_USER_SUPERVISOR',
         'ADMIN_PATCH_USER_SUPERVISOR','ADMIN_DELETE_USER_SUPERVISOR',
         'ADMIN_ELEVATE_ROLE_USER_SUPERVISOR',
         'ADMIN_USER_ROLE_CHANGE','ADMIN_USER_CREATE','ADMIN_USER_DELETE',
         'ADMIN_STRUCTURE_VALIDATE','ADMIN_STRUCTURE_DELETE',
         'ADMIN_STRUCTURE_REFUSAL','ADMIN_STRUCTURE_REFUSE',
         'ADMIN_PASSWORD_RESET','DISABLE_SMS_BY_DOMIFA',
         'UNBLOCK_USER','BLOCK_USER_BY_ADMIN'
       )`
    );

    await queryRunner.query(
      `UPDATE app_log SET "userType" = 'usager'
       WHERE "userType" IS NULL AND action IN (
         'MON_DOMIFA_DOWNLOAD_DOC','MON_DOMIFA_DOWNLOAD_DOC_TRY'
       )`
    );

    await queryRunner.query(
      `UPDATE app_log SET "userType" = 'system'
       WHERE "userType" IS NULL AND action = 'BREVO_SYNC'`
    );

    await queryRunner.query(
      `UPDATE app_log SET "userType" = 'anonymous'
       WHERE "userType" IS NULL AND action = 'THROTTLE_BLOCKED'`
    );

    // USER_CREATE is written by both structure users and super-admins (via the
    // admin-users → users.controller.registerUser proxy). The writer sets
    // structureId on the row only when the actor is a structure user.
    await queryRunner.query(
      `UPDATE app_log SET "userType" = 'user_structure'
       WHERE "userType" IS NULL AND action = 'USER_CREATE'
         AND "structureId" IS NOT NULL`
    );
    await queryRunner.query(
      `UPDATE app_log SET "userType" = 'user_supervisor'
       WHERE "userType" IS NULL AND action = 'USER_CREATE'
         AND "structureId" IS NULL`
    );
  }

  // Data backfill: no rollback. Reverting to NULL would destroy values
  // correctly set by the live writers since the migration ran.
  public async down(): Promise<void> {
    return;
  }
}
