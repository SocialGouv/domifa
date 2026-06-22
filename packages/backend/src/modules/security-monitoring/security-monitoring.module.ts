import { Module } from "@nestjs/common";

import { BehavioralQuotaEnforcerService } from "./services/behavioral-quota-enforcer.service";
import { SecurityAlertEmailService } from "./services/security-alert-email.service";
import { SecurityMonitoringService } from "./services/security-monitoring.service";

@Module({
  providers: [
    SecurityMonitoringService,
    SecurityAlertEmailService,
    BehavioralQuotaEnforcerService,
  ],
  exports: [BehavioralQuotaEnforcerService],
})
export class SecurityMonitoringModule {}
