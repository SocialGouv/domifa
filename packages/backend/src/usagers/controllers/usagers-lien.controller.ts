/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Body,
  Controller,
  Delete,
  Get,
  ParseIntPipe,
  Param,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

import {
  ALL_USER_STRUCTURE_ROLES,
  PageResults,
  Usager,
  UsagerLienSearchResult,
  UsagerLienSuggestion,
  UsagerLienSummary,
} from "@domifa/common";
import {
  AllowUserProfiles,
  AllowUserStructureRoles,
  CurrentUser,
} from "../../auth/decorators";
import { CurrentUsager } from "../../auth/decorators/current-usager.decorator";
import { AppUserGuard } from "../../auth/guards";
import { UsagerAccessGuard } from "../../auth/guards/usager-access.guard";
import { UserStructureAuthenticated } from "../../_common/model";
import { AppLogTable, usagerRepository } from "../../database";
import { AppLogsService } from "../../modules/app-logs/app-logs.service";

import {
  LinkUsagerDto,
  PageOptionsDto,
  RejectSuggestionDto,
  SearchUsagerLienDto,
} from "../dto";
import { UsagerLienService } from "../services/usagerLien.service";
import { UsagerLienLogsService } from "../services/usagerLienLogs.service";

// Every route takes :usagerRef (the current dossier, resolved by
// UsagerAccessGuard like the rest of the usagers module). The TARGET
// dossier, however, is always designated by uuid in the body/response —
// never by ref — because a ref alone isn't enough to guarantee we're
// talking about the same record across the search/suggestion call and the
// link call.
//
// No dedicated @Throttle() here: AppThrottlerGuard.generateKey() only
// keys on (tier, user) — a given "medium" tier is therefore a budget
// SHARED with the rest of the app for that user, not a per-route budget.
// A stricter override than the default global tier (e.g. medium: 20/min,
// copied from an anonymous form) already triggered a "permanent"
// AUTO_BLOCK on a structure account under normal usage. These routes are
// still "subject to the throttler" via the inherited global tier.
@Controller("usagers-lien")
@UseGuards(AuthGuard("jwt"), AppUserGuard)
@AllowUserProfiles("structure")
export class UsagersLienController {
  constructor(
    private readonly usagerLienService: UsagerLienService,
    private readonly usagerLienLogsService: UsagerLienLogsService,
    private readonly appLogsService: AppLogsService
  ) {}

  // Read access open to every role, facteur included: this is what the
  // dossier header display consumes.
  @UseGuards(UsagerAccessGuard)
  @AllowUserStructureRoles(...ALL_USER_STRUCTURE_ROLES)
  @Get(":usagerRef")
  public async getLien(
    @CurrentUsager() currentUsager: Usager,
    @Param("usagerRef", new ParseIntPipe()) _usagerRef: number
  ): Promise<UsagerLienSummary | null> {
    return this.usagerLienService.getLien(currentUsager.uuid);
  }

  @UseGuards(UsagerAccessGuard)
  @AllowUserStructureRoles("simple", "responsable", "admin", "agent")
  @Post(":usagerRef/link")
  public async link(
    @CurrentUsager() currentUsager: Usager,
    @CurrentUser() user: UserStructureAuthenticated,
    @Param("usagerRef", new ParseIntPipe()) _usagerRef: number,
    @Body() dto: LinkUsagerDto
  ): Promise<UsagerLienSummary> {
    const createdBy = {
      userId: user.id,
      userName: `${user.prenom} ${user.nom}`,
    };

    const summary = await this.usagerLienService.link({
      currentUsager,
      targetUsagerUuid: dto.targetUsagerUuid,
      type: "CONJOINT",
      createdBy,
    });

    await this.usagerLienLogsService.logLink({
      currentUsager,
      linkedUsager: summary.linkedUsager,
      user,
      acceptedSuggestion: dto.acceptedSuggestion,
    });

    return summary;
  }

  @UseGuards(UsagerAccessGuard)
  @AllowUserStructureRoles("simple", "responsable", "admin", "agent")
  @Delete(":usagerRef")
  public async unlink(
    @CurrentUsager() currentUsager: Usager,
    @CurrentUser() user: UserStructureAuthenticated,
    @Param("usagerRef", new ParseIntPipe()) _usagerRef: number
  ): Promise<{ message: string }> {
    const { linkedUsagerUuid } = await this.usagerLienService.unlink({
      currentUsager,
    });

    // The linked dossier still exists (only the link itself was deleted):
    // re-read it for the application log (name/ref of the "other" side).
    const linkedUsager = await usagerRepository.findOneByOrFail({
      uuid: linkedUsagerUuid,
    });

    await this.usagerLienLogsService.logUnlink({
      currentUsager,
      linkedUsager,
      user,
    });

    return { message: "UNLINK_SUCCESS" };
  }

  @UseGuards(UsagerAccessGuard)
  @AllowUserStructureRoles("simple", "responsable", "admin", "agent")
  @Get(":usagerRef/suggestion")
  public async getSuggestion(
    @CurrentUsager() currentUsager: Usager,
    @Param("usagerRef", new ParseIntPipe()) _usagerRef: number
  ): Promise<UsagerLienSuggestion | null> {
    return this.usagerLienService.findSuggestion({ currentUsager });
  }

  @UseGuards(UsagerAccessGuard)
  @AllowUserStructureRoles("simple", "responsable", "admin", "agent")
  @Post(":usagerRef/search")
  public async search(
    @CurrentUsager() currentUsager: Usager,
    @Param("usagerRef", new ParseIntPipe()) _usagerRef: number,
    @Body() dto: SearchUsagerLienDto
  ): Promise<UsagerLienSearchResult[]> {
    return this.usagerLienService.search({
      currentUsager,
      query: dto.query,
    });
  }

  @UseGuards(UsagerAccessGuard)
  @AllowUserStructureRoles("simple", "responsable", "admin", "agent")
  @Post(":usagerRef/reject-suggestion")
  public async rejectSuggestion(
    @CurrentUsager() currentUsager: Usager,
    @CurrentUser() user: UserStructureAuthenticated,
    @Param("usagerRef", new ParseIntPipe()) _usagerRef: number,
    @Body() dto: RejectSuggestionDto
  ): Promise<{ message: string }> {
    await this.usagerLienService.rejectSuggestion({
      currentUsager,
      ayantDroitUuid: dto.ayantDroitUuid,
      createdBy: { userId: user.id, userName: `${user.prenom} ${user.nom}` },
    });
    return { message: "REJECTED" };
  }

  @UseGuards(UsagerAccessGuard)
  @AllowUserStructureRoles(...ALL_USER_STRUCTURE_ROLES)
  @Get(":usagerRef/history")
  public async getHistory(
    @CurrentUsager() currentUsager: Usager,
    @Param("usagerRef", new ParseIntPipe()) _usagerRef: number,
    @Query() pageOptions: PageOptionsDto
  ): Promise<PageResults<AppLogTable>> {
    return this.appLogsService.findUsagerLogs({
      usagerUuid: currentUsager.uuid,
      actions: ["USAGERS_LIEN_CREATE", "USAGERS_LIEN_DELETE"],
      page: pageOptions.page,
      take: pageOptions.take,
    });
  }
}
