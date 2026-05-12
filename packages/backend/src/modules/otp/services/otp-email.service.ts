import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from "@nestjs/common";
import * as nodemailer from "nodemailer";
import { Transporter } from "nodemailer";
import { domifaConfig } from "../../../config";
import { redactEmail } from "../otp.utils";
import { generateOtpEmailHtml } from "../templates/otp-email.template";

@Injectable()
export class OtpEmailService {
  private readonly logger = new Logger("OtpEmailService");
  private transporter: Transporter | null = null;

  private getTransporter(): Transporter {
    if (!this.transporter) {
      const { host, port, user, pass } = domifaConfig().smtp;
      if (!host) {
        throw new InternalServerErrorException(
          "SMTP host non configure (DOMIFA_SMTP_HOST manquant)"
        );
      }
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: {
          user,
          pass,
        },
      });
    }
    return this.transporter;
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

    if (!config.smtp.host) {
      const msg = `[SMTP NOT CONFIGURED] DOMIFA_SMTP_HOST non defini - envoi OTP impossible (envId=${config.envId})`;
      if (config.envId === "prod" || config.envId === "preprod") {
        this.logger.error(msg);
        throw new InternalServerErrorException(
          "Service d'envoi d'email indisponible. Veuillez reessayer plus tard."
        );
      }
      this.logger.warn(msg);
      return;
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
}
