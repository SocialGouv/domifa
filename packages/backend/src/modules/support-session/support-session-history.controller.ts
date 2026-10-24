import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { SupportSessionHistoryItem } from "@domifa/common";

import {
  AllowUserProfiles,
  AllowUserSupervisorRoles,
} from "../../auth/decorators";
import { AppUserGuard } from "../../auth/guards";
import { SupportSessionService } from "./support-session.service";
import { SupportSessionHistoryFiltersDto } from "./support-session.dto";

// Every support attachment, across all structures — the per-structure list
// lives in SupportSessionController.
@UseGuards(AuthGuard("jwt"), AppUserGuard)
@Controller("admin/support-sessions")
@AllowUserProfiles("supervisor")
@AllowUserSupervisorRoles("super-admin-domifa")
export class SupportSessionHistoryController {
  constructor(private readonly supportSessionService: SupportSessionService) {}

  @Get()
  public async listSupportSessions(
    @Query() filters: SupportSessionHistoryFiltersDto
  ): Promise<SupportSessionHistoryItem[]> {
    return this.supportSessionService.listAll({
      startDateFrom: filters.startDateFrom
        ? new Date(filters.startDateFrom)
        : undefined,
      startDateTo: filters.startDateTo
        ? new Date(filters.startDateTo)
        : undefined,
    });
  }
}
