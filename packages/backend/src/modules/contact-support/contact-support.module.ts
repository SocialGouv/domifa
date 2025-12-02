import { Module } from "@nestjs/common";
import { ContactSupportController } from "./contact-support.controller";
import { MailsModule } from "../mails/mails.module";

@Module({
  controllers: [ContactSupportController],
  imports: [MailsModule],
})
export class ContactSupportModule {}
