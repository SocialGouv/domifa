import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";

import { PageResults } from "@domifa/common";

import {
  AllowUserProfiles,
  AllowUserSupervisorRoles,
} from "../../../../auth/decorators";
import { AppUserGuard } from "../../../../auth/guards";
import { SuspiciousActivityQueryDto } from "../../dto/suspicious-activity-query.dto";
import { SuspiciousActivityLogDto } from "../../dto/suspicious-activity-log.dto";
import { AdminSecurityService } from "../../services/admin-security/admin-security.service";

@UseGuards(AuthGuard("jwt"), AppUserGuard)
@ApiTags("admin-security")
@AllowUserProfiles("supervisor")
@AllowUserSupervisorRoles("super-admin-domifa")
@ApiBearerAuth()
@Controller("admin/security")
export class AdminSecurityController {
  constructor(private readonly adminSecurityService: AdminSecurityService) {}

  @Get("suspicious-activity")
  @ApiOperation({
    summary:
      "Liste paginée des événements de sécurité (blocages, throttle, etc.)",
  })
  public async listSuspiciousActivity(
    @Query() query: SuspiciousActivityQueryDto
  ): Promise<PageResults<SuspiciousActivityLogDto>> {
    return this.adminSecurityService.findSuspiciousActivity(query);
  }
}
