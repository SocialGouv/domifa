import {
  Injectable,
  InternalServerErrorException,
  Logger,
  OnModuleInit,
} from "@nestjs/common";
import * as nodemailer from "nodemailer";
import { Transporter } from "nodemailer";

import { domifaConfig } from "../../../config";
import { redactEmail } from "../otp.utils";
import { generateOtpEmailHtml } from "../templates/otp-email.template";

@Injectable()
export class OtpEmailService implements OnModuleInit {
  private readonly logger = new Logger("OtpEmailService");
  private transporter: Transporter | null = null;

  // SMTP is the only delivery channel for OTPs: a silent misconfiguration
  // would let the OTP request "succeed" while the user never receives a code.
  // We surface it at boot (clear log) and also throw at send time.
  async onModuleInit(): Promise<void> {
    const config = domifaConfig();

    if (!config.email.emailsEnabled || config.envId === "test") {
      this.logger.warn(
        `OTP emails disabled at boot (envId=${config.envId}, emailsEnabled=${config.email.emailsEnabled})`
      );
      return;
    }

    const missing = listMissingSmtpKeys();
    if (missing.length > 0) {
      this.logger.error(
        `SMTP config incomplete at boot — missing: ${missing.join(", ")}`
      );
      return;
    }

    try {
      await this.getTransporter().verify();
      this.logger.log(
        `SMTP verified at boot (host=${config.smtp.host}, port=${config.smtp.port})`
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`SMTP verify failed at boot: ${message}`);
    }
  }

  async sendOtpEmail(email: string, code: string): Promise<void> {
    const config = domifaConfig();
    const emailLog = redactEmail(email);

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

    const html = generateOtpEmailHtml({ code });

    try {
      const result = await this.getTransporter().sendMail({
        from: config.smtp.from,
        to: recipient,
        subject: "Votre code de connexion DomiFa",
        html,
      });
      this.logger.log(
        `OTP email envoye a ${recipientLog} (original: ${emailLog}), messageId: ${result.messageId}`
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
