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
}
