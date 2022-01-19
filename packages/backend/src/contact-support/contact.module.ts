import { Module } from "@nestjs/common";
import { ContactSupportController } from "./contact-support.controller";
import { ContactSupportService } from "./contact-support.service";

@Module({
  controllers: [ContactSupportController],
  providers: [ContactSupportService],
})
export class ContactSupportModule {}
