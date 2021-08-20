import { HttpException, HttpStatus } from "@nestjs/common";
import { createTransport, SendMailOptions } from "nodemailer";
import { domifaConfig } from "../../../config";
import {
  MessageEmailAttachement,
  MessageEmailContent,
  MessageEmailId,
  MessageEmailRecipient,
  MessageEmailSendDetails,
} from "../../../database";
import { appLogger } from "../../../util";
import { mailRecipientsFilter } from "./mailRecipientsFilter.service";
import Mail = require("nodemailer/lib/mailer");

const smtpTransport = require("nodemailer-smtp-transport");
// create reusable transporter object using SMTP transport

const transporter = createTransport(smtpTransport(domifaConfig().email.smtp));

export const smtpSender = { sendEmail };

async function sendEmail(
  content: Omit<MessageEmailContent, "attachments">,
  {
    messageEmailId,
    attachments,
  }: {
    messageEmailId: MessageEmailId;
    attachments: MessageEmailAttachement[];
  }
): Promise<MessageEmailSendDetails> {
  const { toSend, toSkip } = mailRecipientsFilter.filterRecipients(content.to, {
    messageEmailId,
  });

  if (toSend.length === 0) {
    return {
      sent: toSend,
      skipped: toSkip,
      serverResponse: "all recipients skipped",
    };
  }

  if (!domifaConfig().email.smtp) {
    console.warn("[smtpSender] SMTP not configured");
    return {
      sent: [],
      skipped: toSkip,
      serverResponse: "email sending disabled",
    };
  }

  let subject = content.subject;
  if (domifaConfig().envId !== "prod") {
    subject = `[${domifaConfig().envId}] ${subject}`;
  }

  const icalEvent = content.icalEvent;

  const transporterMailOptions: SendMailOptions = {
    to: toSend.map((x) => mapAddress(x)),
    from: mapAddress(content.from),
    replyTo: mapAddress(content.replyTo),
    subject,
    html: content.html,
    text: content.text,
    icalEvent: icalEvent
      ? {
          filename: icalEvent.filename,
          content: icalEvent.content,
          method: icalEvent.method,
        }
      : undefined,
    attachments: !attachments
      ? undefined
      : attachments.map((a) => {
          const att: Mail.Attachment = {
            contentType: a.contentType,
            filename: a.filename,
            content: a.content,
          };
          return att;
        }),
  };

  try {
    const serverResponse = await transporter.sendMail(transporterMailOptions);
    // SUCCESS
    const sendDetails: MessageEmailSendDetails = {
      sent: toSend,
      skipped: toSkip,
      serverResponse,
    };
    return sendDetails;
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
