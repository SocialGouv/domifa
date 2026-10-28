import { Module } from "@nestjs/common";
import { ContactSupportController } from "./contact-support.controller";
import { MailsModule } from "../mails/mails.module";
import { AntivirusModule } from "../antivirus";

@Module({
  controllers: [ContactSupportController],
  imports: [MailsModule, AntivirusModule],
})
export class ContactSupportModule {}
