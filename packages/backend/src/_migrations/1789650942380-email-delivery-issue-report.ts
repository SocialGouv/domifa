import { MigrationInterface, QueryRunner } from "typeorm";
import { domifaConfig } from "../config";
import { appLogger } from "../util";
import { BrevoSenderService } from "../modules/mails/services/brevo-sender/brevo-sender.service";
import { BrevoSyncCronService } from "../modules/mails/services/brevo-sync-cron.service";
import { EmailDeliveryIssueReason } from "../modules/mails/services/brevo-sync-cron.helpers";

const REASON_LABELS: Record<EmailDeliveryIssueReason, string> = {
  BLOCKLISTED: "Blocklist Brevo",
  BOUNCED: "Rebond / bloqué",
  NEVER_OPENED: "Jamais ouvert",
};

const formatRate = (count: number, total: number): string =>
  total === 0 ? "-" : `${((count / total) * 100).toFixed(1)} %`;

// Fills emailDeliveryIssue right away (same computation as the nightly cron,
// safe to replay) and prints the delivery issue rate per user profile.
export class EmailDeliveryIssueReport1789650942380
  implements MigrationInterface
{
  name = "EmailDeliveryIssueReport1789650942380";

  public async up(queryRunner: QueryRunner): Promise<void> {
    if (domifaConfig().envId !== "prod") {
      appLogger.warn(
        `[email delivery report] Brevo désactivé hors prod (envId=${
          domifaConfig().envId
        }), rapport ignoré`
      );
      return;
    }

    const { issues, preferredSenders } = await new BrevoSyncCronService(
      new BrevoSenderService()
    ).syncEmailDeliveryIssues();

    const users: Array<{ profile: string; email: string }> =
      await queryRunner.query(
        `SELECT 'Utilisateurs structure' AS profile, lower("email") AS email
        FROM "user_structure"
        WHERE "status" <> 'DELETE' AND "email" NOT ILIKE 'deleted-%'
        UNION ALL
        SELECT 'Utilisateurs pilotage' AS profile, lower("email") AS email
        FROM "user_supervisor"
        WHERE "status" <> 'DELETE' AND "email" NOT ILIKE 'deleted-%'`
      );

    const counters = new Map<
      string,
      { total: number; dedicatedSender: number } & Record<
        EmailDeliveryIssueReason,
        number
      >
    >();
    for (const { profile, email } of [
      ...users,
      ...users.map((user) => ({ ...user, profile: "Total" })),
    ]) {
      const counter = counters.get(profile) ?? {
        total: 0,
        dedicatedSender: 0,
        BLOCKLISTED: 0,
        BOUNCED: 0,
        NEVER_OPENED: 0,
      };
      counter.total++;
      if (preferredSenders.has(email.split("@")[1])) {
        counter.dedicatedSender++;
      }
      const reason = issues.get(email);
      if (reason) {
        counter[reason]++;
      }
      counters.set(profile, counter);
    }

    const table = [...counters.entries()].map(([profile, counter]) => {
      const suffering =
        counter.BLOCKLISTED + counter.BOUNCED + counter.NEVER_OPENED;
      return {
        Profil: profile,
        Utilisateurs: counter.total,
        "En souffrance": suffering,
        "Taux de souffrance": formatRate(suffering, counter.total),
        [REASON_LABELS.BLOCKLISTED]: counter.BLOCKLISTED,
        [REASON_LABELS.BOUNCED]: counter.BOUNCED,
        [REASON_LABELS.NEVER_OPENED]: counter.NEVER_OPENED,
        "Expéditeur mail.domifa": counter.dedicatedSender,
      };
    });

    console.log(
      "\n📬 Délivrabilité des emails utilisateurs (Brevo, 90 derniers jours)\n"
    );
    console.table(table);
    console.log(
      `\n${issues.size} adresses en souffrance côté Brevo, ${preferredSenders.size} domaines destinataires sur mail.domifa, flags mis à jour.\n`
    );
  }

  public async down(): Promise<void> {
    // Report only: the flag is recomputed every night by BrevoSyncCronService.
  }
}
