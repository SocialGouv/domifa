import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
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
import { SuspiciousActivityQueryDto } from "../../dto/suspicious-activity-query.dto";
import {
  SecurityUserSummaryDto,
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

  @Get("users/:userType/:userId")
  @ApiOperation({ summary: "Fiche utilisateur (vue sécurité)" })
  @ApiParam({ name: "userType", enum: ["user_structure", "user_supervisor"] })
  public async getUserSummary(
    @Param("userType") userType: "user_structure" | "user_supervisor",
    @Param("userId", ParseIntPipe) userId: number
  ): Promise<SecurityUserSummaryDto> {
    return this.adminSecurityService.getUserSummary(userType, userId);
  }

  @Get("users/:userType/:userId/sessions")
  @ApiOperation({
    summary: "Sessions courante + historique d'un utilisateur",
  })
  @ApiParam({ name: "userType", enum: ["user_structure", "user_supervisor"] })
  public async getUserSessions(
    @Param("userType") userType: "user_structure" | "user_supervisor",
    @Param("userId", ParseIntPipe) userId: number
  ): Promise<UserSessionsViewDto> {
    return this.adminSecurityService.getUserSessions(userType, userId);
  }
}
