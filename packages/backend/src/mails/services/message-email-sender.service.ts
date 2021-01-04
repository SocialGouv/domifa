import { Injectable } from "@nestjs/common";
import { domifaConfig } from "../../config";
import {
  MessageEmail,
  MessageEmailContent,
  messageEmailRepository,
  MessageEmailTable,
  pgBinaryUtil,
} from "../../database";
import { MessageEmailConsummer } from "./message-email-consumer.service";

@Injectable()
export class MessageEmailSender {
  constructor(private messageEmailConsummer: MessageEmailConsummer) {}

  public async sendMailLater(
    content: MessageEmailContent,
    {
      initialScheduledDate,
      emailId,
    }: Pick<MessageEmail, "initialScheduledDate" | "emailId">
  ) {
    const attachments = pgBinaryUtil.write(content.attachments);
    delete content.attachments;
    const messageEmail = new MessageEmailTable({
      status: "pending",
      initialScheduledDate,
      nextScheduledDate: initialScheduledDate,
      emailId,
      content,
      attachments,
    });

    await messageEmailRepository.save(messageEmail);

    if (domifaConfig().cron.emailConsumer.enableSendImmadiately) {
      this.messageEmailConsummer.triggerNextSending();
    }
  }
}
