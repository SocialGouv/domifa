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

// Toutes les routes prennent :usagerRef (dossier courant, résolu par
// UsagerAccessGuard comme le reste du module usagers). Le dossier CIBLE,
// lui, est toujours désigné par uuid dans le body/réponse — jamais par ref
// — car un ref seul ne suffit pas à garantir qu'on parle du même
// enregistrement entre la recherche/suggestion et l'appel de liaison.
//
// Pas de @Throttle() dédié ici : AppThrottlerGuard.generateKey() ne clé
// que sur (tier, utilisateur) — un même tier "medium" est donc un budget
// PARTAGÉ avec tout le reste de l'app pour cet utilisateur, pas un budget
// par route. Un override plus strict que le tier global par défaut (ex.
// medium: 20/min, copié depuis un formulaire anonyme) a déjà déclenché un
// AUTO_BLOCK "permanent" sur un compte structure en usage normal. Ces
// routes restent bien "soumises au throttler" via le tier global hérité.
@Controller("usagers-lien")
@UseGuards(AuthGuard("jwt"), AppUserGuard)
@AllowUserProfiles("structure")
export class UsagersLienController {
  constructor(
    private readonly usagerLienService: UsagerLienService,
    private readonly usagerLienLogsService: UsagerLienLogsService,
    private readonly appLogsService: AppLogsService
  ) {}

  // Lecture ouverte à tous les rôles, facteur inclus : c'est l'affichage en
  // haut de fiche qui consomme cet endpoint.
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

    // Le dossier lié existe toujours (seul le lien a été supprimé) : on le
    // relit pour le log applicatif (nom/prénom/ref du côté "autre" dossier).
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
