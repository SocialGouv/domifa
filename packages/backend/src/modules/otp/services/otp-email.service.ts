import { Injectable, Logger } from "@nestjs/common";
import * as nodemailer from "nodemailer";
import { Transporter } from "nodemailer";
import { domifaConfig } from "../../../config";
import { generateOtpEmailHtml } from "../templates/otp-email.template";

@Injectable()
export class OtpEmailService {
  private readonly logger = new Logger("OtpEmailService");
  private transporter: Transporter | null = null;

  private getTransporter(): Transporter {
    if (!this.transporter) {
      const { host, port, user, pass } = domifaConfig().smtp;
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

  async sendOtpEmail(
    email: string,
    code: string,
    userName?: string
  ): Promise<void> {
    const config = domifaConfig();

    if (!config.email.emailsEnabled || config.envId === "test") {
      this.logger.log(
        `[EMAILS DISABLED] OTP email non envoye - To: ${email}, Raison: ${
          config.email.emailsEnabled ? "envId=test" : "emailsEnabled=false"
        }`
      );
      return;
    }

    if (!config.smtp.host) {
      this.logger.warn(
        `[SMTP NOT CONFIGURED] OTP email non envoye - DOMIFA_SMTP_HOST non defini`
      );
      return;
    }

    const recipient =
      config.envId === "prod"
        ? email
        : config.email.emailAddressRedirectAllTo || email;

    const html = generateOtpEmailHtml({ code, userName });

    try {
      const result = await this.getTransporter().sendMail({
        from: config.smtp.from,
        to: recipient,
        subject: "Votre code de connexion DomiFa",
        html,
      });
      this.logger.log(
        `OTP email envoye a ${recipient} (original: ${email}), messageId: ${result.messageId}`
      );
    } catch (error) {
      this.logger.error(
        `Erreur lors de l'envoi de l'email OTP a ${recipient}`,
        error
      );
      throw error;
    }
  }
}
