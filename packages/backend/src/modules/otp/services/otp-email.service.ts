import {
  Injectable,
  InternalServerErrorException,
  Logger,
  OnModuleInit,
} from "@nestjs/common";
import * as nodemailer from "nodemailer";
import { Transporter } from "nodemailer";

import { domifaConfig } from "../../../config";
import { BrevoSenderService } from "../../mails/services/brevo-sender/brevo-sender.service";
import { isDeletedEmail } from "../../mails/services/brevo-sender/deleted-email.guard";
import { OtpPurpose } from "@domifa/common";
import { OTP_TIPIMAIL_FROM } from "../otp.constants";
import { OTP_ACTION_MOTIF_LABELS } from "../otp.labels";
import { redactEmail } from "../otp.utils";
import { generateOtpActionEmailHtml } from "../templates/otp-action-email.template";
import { generateOtpEmailHtml } from "../templates/otp-email.template";

@Injectable()
export class OtpEmailService implements OnModuleInit {
  private readonly logger = new Logger("OtpEmailService");
  private transporter: Transporter | null = null;

  constructor(private readonly brevoSender: BrevoSenderService) {}

  // Config presence is already enforced by parseSmtpConfig at config load
  // (HOST/USER/PASS are required env vars). We log the SMTP target at boot
  // for ops visibility but skip transporter.verify() — a live SMTP ping at
  // startup would make the whole API susceptible to transient network blips.
  // Send-time errors are surfaced cleanly by sendOtpEmail's try/catch.
  async onModuleInit(): Promise<void> {
    const config = domifaConfig();

    if (
      !config.email.emailsEnabled ||
      config.envId === "test" ||
      config.envId === "local"
    ) {
      this.logger.warn(
        `OTP emails disabled at boot (envId=${config.envId}, emailsEnabled=${config.email.emailsEnabled})`
      );
      return;
    }

    this.logger.log(
      `OTP provider=${config.email.otpProvider} (SMTP host=${config.smtp.host}, port=${config.smtp.port}, user=${config.smtp.user})`
    );
  }

  async sendOtpEmail(args: {
    email: string;
    prenom: string;
    code: string;
    purpose: OtpPurpose;
    // "Renvoyer le code": a previous code is still active, so the first email
    // likely never arrived.
    forceTipimail?: boolean;
  }): Promise<void> {
    const { email, prenom, code, purpose, forceTipimail } = args;
    const config = domifaConfig();
    const emailLog = redactEmail(email);

    if (isDeletedEmail(email)) {
      this.logger.warn(
        `[OTP SKIP] Destinataire préfixé "deleted-" (${emailLog}), envoi ignoré`
      );
      return;
    }

    // Plaintext OTP in the console on developer/dev environments, whether or
    // not the email itself goes out. prod and preprod never reach this branch.
    if (config.envId === "local" || config.envId === "dev") {
      this.logger.log(
        `[OTP ${config.envId.toUpperCase()}] code=${code} purpose=${purpose} to=${emailLog}`
      );
    }

    // local never sends: no mail provider is reachable from a developer
    // machine, the console log above is the delivery channel.
    if (
      !config.email.emailsEnabled ||
      config.envId === "test" ||
      config.envId === "local"
    ) {
      this.logger.log(
        `[EMAILS DISABLED] OTP email non envoye - To: ${emailLog}, Raison: ${
          config.email.emailsEnabled
            ? `envId=${config.envId}`
            : "emailsEnabled=false"
        }`
      );
      return;
    }

    const recipient =
      config.envId === "prod"
        ? email
        : config.email.emailAddressRedirectAllTo || email;
    const recipientLog = redactEmail(recipient);
    const isLogin = purpose === "LOGIN";

    // Outside prod every Brevo call is disabled (shared account, see
    // isBrevoCallSkipped in brevo-sender.service): the OTP is the only email
    // that must still go out, through Tipimail SMTP.
    if (config.envId !== "prod") {
      await this.sendViaSmtp({ recipient, code, isLogin, purpose, emailLog });
      return;
    }

    // Default routing: Brevo, with Tipimail as fallback if Brevo rejects.
    // Users flagged by the nightly delivery issue cron (or whose flag can't
    // be read) get the SAME code via both providers — fails only if BOTH
    // reject.
    const dualSend =
      forceTipimail ||
      (await this.brevoSender.hasEmailDeliveryIssue([email]).catch((error) => {
        this.logger.warn(
          `Flag emailDeliveryIssue illisible pour ${emailLog}, double envoi: ${
            error instanceof Error ? error.message : String(error)
          }`
        );
        return true;
      }));

    if (!dualSend) {
      try {
        await this.sendViaBrevo({ recipient, code, prenom, purpose, isLogin });
        this.logger.log(
          `OTP Brevo OK a ${recipientLog} (original: ${emailLog}, purpose=${purpose})`
        );
      } catch (err) {
        this.logger.error(
          `OTP Brevo KO a ${recipientLog} (original: ${emailLog}, purpose=${purpose}), secours Tipimail: ${
            err instanceof Error ? err.message : String(err)
          }`
        );
        await this.sendViaSmtp({ recipient, code, isLogin, purpose, emailLog });
      }
      return;
    }

    const [brevoResult, smtpResult] = await Promise.allSettled([
      this.sendViaBrevo({ recipient, code, prenom, purpose, isLogin }),
      this.sendViaSmtp({ recipient, code, isLogin, purpose, emailLog }),
    ]);

    if (brevoResult.status === "fulfilled") {
      this.logger.log(
        `OTP Brevo OK a ${recipientLog} (original: ${emailLog}, purpose=${purpose})`
      );
    } else {
      this.logger.error(
        `OTP Brevo KO a ${recipientLog} (original: ${emailLog}, purpose=${purpose}): ${
          brevoResult.reason instanceof Error
            ? brevoResult.reason.message
            : String(brevoResult.reason)
        }`
      );
    }

    if (brevoResult.status === "rejected" && smtpResult.status === "rejected") {
      throw smtpResult.reason;
    }
  }

  private async sendViaBrevo(params: {
    recipient: string;
    code: string;
    prenom: string;
    purpose: OtpPurpose;
    isLogin: boolean;
  }): Promise<void> {
    const { recipient, code, prenom, purpose, isLogin } = params;
    const { templates } = domifaConfig().brevo;
    const templateId = isLogin ? templates.otpLogin : templates.otpAction;

    if (!templateId) {
      throw new Error(
        `Missing Brevo template id (${
          isLogin
            ? "DOMIFA_BREVO_TEMPLATES_OTP_LOGIN"
            : "DOMIFA_BREVO_TEMPLATES_OTP_ACTION"
        })`
      );
    }

    const templateParams: Record<string, string> = { code, prenom };
    if (purpose !== "LOGIN") {
      templateParams.motif = OTP_ACTION_MOTIF_LABELS[purpose];
    }

    await this.brevoSender.sendEmailWithTemplate({
      templateId,
      to: [{ email: recipient, name: recipient }],
      params: templateParams,
    });
  }

  private async sendViaSmtp(params: {
    recipient: string;
    code: string;
    isLogin: boolean;
    purpose: OtpPurpose;
    emailLog: string;
  }): Promise<void> {
    const { recipient, code, isLogin, purpose, emailLog } = params;
    const config = domifaConfig();
    const recipientLog = redactEmail(recipient);

    const missing = listMissingSmtpKeys();
    if (missing.length > 0) {
      this.logger.error(
        `[SMTP NOT CONFIGURED] Cannot send OTP - missing: ${missing.join(
          ", "
        )} (envId=${config.envId})`
      );
      throw new InternalServerErrorException(
        "Service d'envoi d'email indisponible. Veuillez reessayer plus tard."
      );
    }

    const html = isLogin
      ? generateOtpEmailHtml({ code })
      : generateOtpActionEmailHtml({ code });
    const subject = isLogin
      ? "Votre code de connexion DomiFa"
      : "Votre code de confirmation DomiFa";

    try {
      const result = await this.getTransporter().sendMail({
        // Hardcoded (see OTP_TIPIMAIL_FROM): DKIM/SPF alignment on Tipimail.
        // DOMIFA_SMTP_FROM env is intentionally ignored on this path.
        from: OTP_TIPIMAIL_FROM,
        to: recipient,
        subject,
        html,
      });
      this.logger.log(
        `OTP email envoye via SMTP a ${recipientLog} (original: ${emailLog}, purpose=${purpose}), messageId: ${result.messageId}`
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Erreur lors de l'envoi de l'email OTP a ${recipientLog}: ${message}`
      );
      throw error;
    }
  }

  private getTransporter(): Transporter {
    if (!this.transporter) {
      const { host, port, user, pass, timeoutMs } = domifaConfig().smtp;
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
}

function listMissingSmtpKeys(): string[] {
  // FROM is hardcoded (OTP_TIPIMAIL_FROM) — only the transport keys are
  // required from env.
  const { host, port, user, pass } = domifaConfig().smtp;
  const missing: string[] = [];
  if (!host) missing.push("DOMIFA_SMTP_HOST");
  if (!port) missing.push("DOMIFA_SMTP_PORT");
  if (!user) missing.push("DOMIFA_SMTP_USER");
  if (!pass) missing.push("DOMIFA_SMTP_PASS");
  return missing;
}
