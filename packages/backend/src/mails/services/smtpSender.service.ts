import { HttpException, HttpStatus } from "@nestjs/common";
import { createTransport, SendMailOptions } from "nodemailer";
import { domifaConfig } from "../../config";
import { MessageEmailContentFull, MessageEmailRecipient } from "../../database";
import { appLogger } from "../../util";
import Mail = require("nodemailer/lib/mailer");

const smtpTransport = require("nodemailer-smtp-transport");
// create reusable transporter object using SMTP transport

const transporter = createTransport(smtpTransport(domifaConfig().email.smtp));

export const smtpSender = { sendEmail };

async function sendEmail(content: MessageEmailContentFull): Promise<boolean> {
  if (!domifaConfig().email.smtp) {
    console.warn("[smtpSender] SMTP not configured");
    return false;
  }

  const transporterMailOptions: SendMailOptions = {
    to: content.to.map((x) => mapAddress(x)),
    from: mapAddress(content.from),
    replyTo: mapAddress(content.replyTo),
    subject: content.subject,
    html: content.html,
    text: content.text,
  };

  try {
    return transporter.sendMail(transporterMailOptions);
  } catch (err) {
    appLogger.warn(
      `[smtpSender] Error sending smtp message: : ${err.message}`,
      {
        sentryBreadcrumb: true,
      }
    );
    appLogger.error(`[smtpSender] Error sending smtp message`);
    throw new HttpException(`SMTP_ERROR`, HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
function mapAddress(x: MessageEmailRecipient): Mail.Address {
  return {
    name: x.personalName,
    address: x.address,
  };
}
