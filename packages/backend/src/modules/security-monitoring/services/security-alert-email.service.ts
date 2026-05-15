import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from "@nestjs/common";
import * as nodemailer from "nodemailer";
import { Transporter } from "nodemailer";

import { domifaConfig, DomifaConfig } from "../../../config";
import { generateSecurityAlertEmailHtml } from "../templates/security-alert-email.template";
import { SuspiciousActivitySummary } from "../types/security-alert.types";

type GuardResult = { sent: false; reason: string } | { sent: true };

@Injectable()
export class SecurityAlertEmailService {
  private readonly logger = new Logger("SecurityAlertEmailService");
  private transporter: Transporter | null = null;

  private getTransporter(): Transporter {
    if (!this.transporter) {
      const { host, port, user, pass, timeoutMs } = domifaConfig().smtp;
      if (!host) {
        throw new InternalServerErrorException(
          "SMTP host non configure (DOMIFA_SMTP_HOST manquant)"
        );
      }
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
        connectionTimeout: timeoutMs,
        greetingTimeout: timeoutMs,
        socketTimeout: timeoutMs,
      });
    }
    return this.transporter;
  }

  public async sendSuspiciousActivityAlert(
    summary: SuspiciousActivitySummary
  ): Promise<GuardResult> {
    const config = domifaConfig();

    const preflight = this.runPreflight(config);
    if (preflight) return preflight;

    const recipients = resolveBaseRecipients(config);
    if (recipients.length === 0) {
      this.logger.warn(
        "[SECURITY ALERT] Aucun destinataire configure (DOMIFA_ERROR_REPORT_EMAILS et DOMIFA_ADMIN_EMAIL vides) - alerte non envoyee"
      );
      return { sent: false, reason: "no_recipient_configured" };
    }

    const effectiveRecipients = resolveEffectiveRecipients(config, recipients);
    const html = generateSecurityAlertEmailHtml(summary, config.envId);

    try {
      const result = await this.getTransporter().sendMail({
        from: config.smtp.from,
        to: effectiveRecipients,
        subject: `[DomiFa - ${config.envId.toUpperCase()}] Alerte securite - activite suspecte detectee`,
        html,
      });
      this.logger.log(
        `[SECURITY ALERT] Mail envoye a ${effectiveRecipients.join(
          ", "
        )}, messageId: ${result.messageId}`
      );
      return { sent: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `[SECURITY ALERT] Erreur lors de l'envoi a ${effectiveRecipients.join(
          ", "
        )}: ${message}`
      );
      throw error;
    }
  }

  private runPreflight(config: DomifaConfig): GuardResult | null {
    if (!config.email.emailsEnabled || config.envId === "test") {
      const reason = config.email.emailsEnabled
        ? "envId=test"
        : "emailsEnabled=false";
      this.logger.log(
        `[EMAILS DISABLED] Security alert non envoye (${reason})`
      );
      return { sent: false, reason };
    }

    if (!config.smtp.host) {
      const msg = `[SMTP NOT CONFIGURED] DOMIFA_SMTP_HOST non defini - alerte securite non envoyee (envId=${config.envId})`;
      if (config.envId === "prod" || config.envId === "preprod") {
        this.logger.error(msg);
      } else {
        this.logger.warn(msg);
      }
      return { sent: false, reason: "smtp_not_configured" };
    }

    return null;
  }
}

function resolveBaseRecipients(config: DomifaConfig): string[] {
  const primary = config.email.emailAddressErrorReport ?? [];
  if (primary.length > 0) return primary;
  const admin = config.email.emailAddressAdmin;
  return admin ? [admin] : [];
}

function resolveEffectiveRecipients(
  config: DomifaConfig,
  baseRecipients: string[]
): string[] {
  if (config.envId === "prod") return baseRecipients;
  const redirect = config.email.emailAddressRedirectAllTo;
  return redirect ? [redirect] : baseRecipients;
}
