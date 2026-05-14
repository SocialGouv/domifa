import { Module } from "@nestjs/common";

import { SecurityAlertEmailService } from "./services/security-alert-email.service";
import { SecurityMonitoringService } from "./services/security-monitoring.service";

@Module({
  providers: [SecurityMonitoringService, SecurityAlertEmailService],
})
export class SecurityMonitoringModule {}
