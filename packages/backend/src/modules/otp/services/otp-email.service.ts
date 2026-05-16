import {
  Injectable,
  InternalServerErrorException,
  Logger,
  OnModuleInit,
} from "@nestjs/common";
import * as nodemailer from "nodemailer";
import { Transporter } from "nodemailer";

import { domifaConfig } from "../../../config";
import { OtpPurpose } from "../otp.types";
import { redactEmail } from "../otp.utils";
import { generateOtpActionEmailHtml } from "../templates/otp-action-email.template";
import { generateOtpEmailHtml } from "../templates/otp-email.template";

@Injectable()
export class OtpEmailService implements OnModuleInit {
  private readonly logger = new Logger("OtpEmailService");
  private transporter: Transporter | null = null;

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
      `SMTP configured (host=${config.smtp.host}, port=${config.smtp.port}, user=${config.smtp.user})`
    );
  }

  async sendOtpEmail(
    email: string,
    code: string,
    purpose: OtpPurpose
  ): Promise<void> {
    const config = domifaConfig();
    const emailLog = redactEmail(email);

    if (config.envId === "local") {
      this.logger.log(
        `[OTP LOCAL] code=${code} purpose=${purpose} to=${emailLog} (SMTP skipped en local)`
      );
      return;
    }

    if (!config.email.emailsEnabled || config.envId === "test") {
      this.logger.log(
        `[EMAILS DISABLED] OTP email non envoye - To: ${emailLog}, Raison: ${
          config.email.emailsEnabled ? "envId=test" : "emailsEnabled=false"
        }`
      );
      return;
    }

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

    const recipient =
      config.envId === "prod"
        ? email
        : config.email.emailAddressRedirectAllTo || email;
    const recipientLog = redactEmail(recipient);

    const isLogin = purpose === "LOGIN";
    const html = isLogin
      ? generateOtpEmailHtml({ code })
      : generateOtpActionEmailHtml({ code });
    const subject = isLogin
      ? "Votre code de connexion DomiFa"
      : "Votre code de confirmation DomiFa";

    try {
      const result = await this.getTransporter().sendMail({
        from: config.smtp.from,
        to: recipient,
        subject,
        html,
      });
      this.logger.log(
        `OTP email envoye a ${recipientLog} (original: ${emailLog}, purpose=${purpose}), messageId: ${result.messageId}`
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
  const { host, port, user, pass, from } = domifaConfig().smtp;
  const missing: string[] = [];
  if (!host) missing.push("DOMIFA_SMTP_HOST");
  if (!port) missing.push("DOMIFA_SMTP_PORT");
  if (!user) missing.push("DOMIFA_SMTP_USER");
  if (!pass) missing.push("DOMIFA_SMTP_PASS");
  if (!from) missing.push("DOMIFA_SMTP_FROM");
  return missing;
}
