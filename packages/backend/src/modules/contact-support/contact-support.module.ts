import { Module } from "@nestjs/common";
import { ContactSupportController } from "./contact-support.controller";

@Module({
  controllers: [ContactSupportController],
  providers: [],
})
export class ContactSupportModule {}
