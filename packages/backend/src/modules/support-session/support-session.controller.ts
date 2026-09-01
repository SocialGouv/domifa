import {
  Controller,
  Delete,
  Get,
  ParseUUIDPipe,
  Param,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Request as ExpressRequest } from "express";
import {
  ActivateSupportSessionResponse,
  Structure,
  SupportSession,
} from "@domifa/common";

import {
  AllowUserProfiles,
  AllowUserSupervisorRoles,
  CurrentStructure,
} from "../../auth/decorators";
import { CurrentSupervisor } from "../../auth/decorators/current-supervisor.decorator";
import { AppUserGuard, StructureAccessGuard } from "../../auth/guards";
import { UserAdminAuthenticated } from "../../_common/model";
import { buildSecurityLogRequestContext } from "../../util/express";
import { SupportSessionService } from "./support-session.service";

// Kept as a dedicated controller (rather than folded into
// AdminStructuresController) so the mode-support feature — activation,
// listing, revocation — stays a self-contained, independently readable
// slice of the admin API surface.
@UseGuards(AuthGuard("jwt"), AppUserGuard)
@Controller("admin/structures/structure/:structureUuid")
@ApiTags("dashboard")
@AllowUserProfiles("supervisor")
@AllowUserSupervisorRoles("super-admin-domifa")
@ApiBearerAuth()
export class SupportSessionController {
  constructor(private readonly supportSessionService: SupportSessionService) {}

  @ApiBearerAuth()
  @ApiOperation({
    summary: "Activer le mode support (lecture seule) sur une structure",
  })
  @Post("support-session")
  @UseGuards(StructureAccessGuard)
  public async activateSupportSession(
    @Req() req: ExpressRequest,
    @CurrentSupervisor() user: UserAdminAuthenticated,
    @CurrentStructure() structure: Structure
  ): Promise<ActivateSupportSessionResponse> {
    const requestContext = buildSecurityLogRequestContext(req);
    return this.supportSessionService.activate(user, structure.uuid, {
      ip: requestContext.ip ?? "",
      userAgent: requestContext.userAgent ?? "",
    });
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: "Lister les sessions support d'une structure" })
  @Get("support-sessions")
  @UseGuards(StructureAccessGuard)
  public async listSupportSessions(
    @CurrentSupervisor() _user: UserAdminAuthenticated,
    @CurrentStructure() structure: Structure
  ): Promise<SupportSession[]> {
    return this.supportSessionService.listForStructure(structure.id);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: "Révoquer une session support" })
  @Delete("support-session/:supportSessionUuid")
  @UseGuards(StructureAccessGuard)
  public async revokeSupportSession(
    @Req() req: ExpressRequest,
    @CurrentSupervisor() user: UserAdminAuthenticated,
    @CurrentStructure() _structure: Structure,
    @Param("supportSessionUuid", new ParseUUIDPipe()) supportSessionUuid: string
  ): Promise<{ status: "REVOKED" }> {
    const requestContext = buildSecurityLogRequestContext(req);
    await this.supportSessionService.revoke(
      user,
      supportSessionUuid,
      requestContext
    );
    return { status: "REVOKED" };
  }
}
