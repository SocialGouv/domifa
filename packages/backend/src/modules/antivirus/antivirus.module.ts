import { Module } from "@nestjs/common";

import { AntivirusService } from "./antivirus.service";

@Module({
  providers: [AntivirusService],
  exports: [AntivirusService],
})
export class AntivirusModule {}
