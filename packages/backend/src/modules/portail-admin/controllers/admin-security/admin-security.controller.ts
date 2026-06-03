import {
  Controller,
  Get,
  Param,
  ParseEnumPipe,
  ParseUUIDPipe,
  Query,
  UseGuards,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiTags,
} from "@nestjs/swagger";
import { Throttle } from "@nestjs/throttler";

import { PageResults } from "@domifa/common";

import {
  AllowUserProfiles,
  AllowUserSupervisorRoles,
} from "../../../../auth/decorators";
import { AppUserGuard } from "../../../../auth/guards";
import {
  SUSPICIOUS_USER_PROFILES,
  SuspiciousActivityQueryDto,
  SuspiciousUserProfile,
} from "../../dto/suspicious-activity-query.dto";
import {
  SuspiciousActivityLogDto,
  UserSessionsViewDto,
} from "../../dto/suspicious-activity-log.dto";
import {
  SessionsStats,
  SessionsStatsQueryDto,
} from "../../dto/sessions-stats.dto";
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

  @Get("users/:userType/:uuid/sessions")
  @ApiOperation({
    summary: "Sessions courante + historique d'un utilisateur",
  })
  @ApiParam({ name: "userType", enum: SUSPICIOUS_USER_PROFILES })
  public async getUserSessions(
    @Param("userType", new ParseEnumPipe(SUSPICIOUS_USER_PROFILES))
    userType: SuspiciousUserProfile,
    @Param("uuid", new ParseUUIDPipe()) uuid: string
  ): Promise<UserSessionsViewDto> {
    return this.adminSecurityService.getUserSessions(userType, uuid);
  }

  // Réservé super-admin-domifa (guards de classe). Throttle aligné sur
  // /metabase-stats : court/moyen/long pour neutraliser le scraping.
  @Throttle({
    short: { limit: 5, ttl: 1_000, blockDuration: 300_000 },
    medium: { limit: 30, ttl: 60_000, blockDuration: 900_000 },
    long: { limit: 300, ttl: 3_600_000, blockDuration: 3_600_000 },
  })
  @Get("sessions/stats")
  @ApiOperation({
    summary:
      "Volumétrie des sessions structure (actifs 24h / 48h / 7j / jamais)",
  })
  public async getSessionsStats(
    @Query() query: SessionsStatsQueryDto
  ): Promise<SessionsStats> {
    return this.adminSecurityService.getSessionsStats(query);
  }
}
