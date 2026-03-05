import { PhoneNumberFormat } from "google-libphonenumber";
import { format } from "date-fns";
import { QueryRunner } from "typeorm";
import { MessageSmsTable, messageSmsRepository } from "../database";
import { appLogger, getPhoneString } from "../util";

export async function createSmsMigrationForStructure(
  queryRunner: QueryRunner,
  structureId: number,
  dryRun: boolean
): Promise<void> {
  appLogger.warn(
    `[Migration] Début création SMS portail | structureId=${structureId} | DRY_RUN=${dryRun}`
  );

  // ─────────────────────────────────────────────────────────
  // Récupération des usagers actifs de la structure
  // avec portail usager activé et un numéro de téléphone
  // + jointure user_usager pour récupérer le login
  // Exclut les usagers ayant déjà personnalisé leur mot de passe
  // ─────────────────────────────────────────────────────────
  const usagers: Array<{
    ref: number;
    dateNaissance: Date;
    telephone: { countryCode: string; numero: string };
    login: string;
  }> = await queryRunner.query(
    `
    SELECT u.ref, u."dateNaissance", u.telephone, uu.login
    FROM usager u
    JOIN user_usager uu ON uu."usagerUUID" = u.uuid
    WHERE u."structureId" = $1
      AND u.statut = 'VALIDE'
      AND u.options->>'portailUsagerEnabled' = 'true'
      AND u.telephone->>'numero' IS NOT NULL
      AND u.telephone->>'numero' != ''
      AND uu."passwordType" != 'PERSONAL'
  `,
    [structureId]
  );

  // Récupération du senderName de la structure
  const structureRows: Array<{ sms: { senderName: string } }> =
    await queryRunner.query(`SELECT sms FROM structure WHERE id = $1`, [
      structureId,
    ]);

  if (!structureRows.length) {
    appLogger.error(`[Migration] Structure ${structureId} introuvable — arrêt`);
    return;
  }

  const senderName = structureRows[0].sms?.senderName || "DOMIFA";

  console.log(`\n${"═".repeat(80)}`);
  console.log(`STRUCTURE ${structureId} | senderName=${senderName}`);
  console.log(`Usagers éligibles : ${usagers.length}`);
  console.log(`${"═".repeat(80)}\n`);

  const smsToSave: MessageSmsTable[] = [];

  for (const usager of usagers) {
    const dateNaissance = new Date(usager.dateNaissance);
    const motDePasse = format(dateNaissance, "ddMMyyyy");

    const phoneNumber = getPhoneString(
      usager.telephone,
      PhoneNumberFormat.E164
    );

    if (!phoneNumber) {
      console.log(
        `  [SKIP] usagerRef=${usager.ref} — numéro de téléphone invalide`
      );
      continue;
    }

    const content = `Nouveau site Inserasaf pour voir votre courrier !\nID: ${usager.login}\nMot de passe: votre date de naissance\nLien: https://urlr.me/JCdwYs\nDomiFa`;

    console.log(
      `  usagerRef=${usager.ref} | login=${usager.login} | mdp=${motDePasse} | phone=${phoneNumber}`
    );

    smsToSave.push(
      new MessageSmsTable({
        usagerRef: usager.ref,
        structureId,
        content,
        senderName,
        status: "TO_SEND",
        smsId: "idMonDomiFa",
        phoneNumber,
        scheduledDate: new Date(),
        errorCount: 0,
      })
    );
  }

  console.log(`\n${"═".repeat(80)}`);
  console.log(`SMS à créer : ${smsToSave.length}`);
  console.log(`${"═".repeat(80)}\n`);

  if (!dryRun && smsToSave.length > 0) {
    const BATCH_SIZE = 1000;
    for (let i = 0; i < smsToSave.length; i += BATCH_SIZE) {
      const batch = smsToSave.slice(i, i + BATCH_SIZE);
      await messageSmsRepository.save(batch);
      appLogger.warn(
        `[Migration] Batch ${Math.floor(i / BATCH_SIZE) + 1} — ${
          batch.length
        } SMS insérés`
      );
    }
    appLogger.warn(`[Migration] ${smsToSave.length} SMS créés avec succès`);
  }

  if (dryRun) {
    appLogger.warn("[Migration] DRY_RUN=true — aucune modification appliquée");
    throw new Error("Fin de migration DRY_RUN - vérifier les logs");
  }
}
