import {
  Controller,
  Get,
  Body,
  HttpStatus,
  NotFoundException,
  Query,
  Req,
  Res,
  UseGuards,
  Param,
  ParseUUIDPipe,
  Patch,
} from "@nestjs/common";
import { Request as ExpressRequest } from "express";
import { buildSecurityLogRequestContext } from "../../../../util/express";
import { AuthGuard } from "@nestjs/passport";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";

import { PageOptionsDto } from "../../../../usagers/dto/pagination/page-options.dto";

import {
  AllowUserProfiles,
  AllowUserSupervisorRoles,
  CurrentStructure,
} from "../../../../auth/decorators";
import { AppUserGuard, StructureAccessGuard } from "../../../../auth/guards";
import {
  structureRepository,
  userStructureSecurityRepository,
} from "../../../../database";
import { statsDeploiementExporter } from "../../../../excel/export-stats-deploiement";

import { expressResponseExcelRenderer } from "../../../../util";
import { ExpressResponse } from "../../../../util/express";
import { UserAdminAuthenticated } from "../../../../_common/model";
import { AdminStructuresService } from "../../services";

import {
  Structure,
  StructureAdmin,
  StructureDecisionStatut,
  StructureSessionRecord,
  UserStructure,
} from "@domifa/common";
import { AppLogsService } from "../../../app-logs/app-logs.service";
import { AppLogSecurityService } from "../../../app-logs/app-log-security.service";
import { buildSupervisorActorFields } from "../../../app-logs/app-logs.helpers";
import {
  DeleteStructureDto,
  UnblockUserDto,
  UpdateStructureDecisionStatutDto,
} from "../../dto";
import { UserStructureWithSecurity } from "../../types";
import { format } from "date-fns";
import { userSecurityEventHistoryManager } from "../../../users/services";
import { CurrentSupervisor } from "../../../../auth/decorators/current-supervisor.decorator";
import { StructureDecisionEmailService } from "../../services/structure-decision-email/structure-decision-email.service";
import { StructureDecisionService } from "../../services/structure-decision/structure-decision.service";
import { OtpGuard } from "../../../otp/guards/otp.guard";
import { RequireOtp } from "../../../otp/decorators/require-otp.decorator";
import { BlockUserByAdminLogContext } from "../../../app-logs/types/app-log-context.types";

@UseGuards(AuthGuard("jwt"), AppUserGuard)
@Controller("admin/structures")
@ApiTags("dashboard")
@AllowUserProfiles("supervisor")
@AllowUserSupervisorRoles("super-admin-domifa")
@ApiBearerAuth()
export class AdminStructuresController {
  constructor(
    private readonly adminStructuresService: AdminStructuresService,
    private readonly appLogsService: AppLogsService,
    private readonly appLogSecurityService: AppLogSecurityService,
    private readonly structureDecisionService: StructureDecisionService,
    private readonly structureDecisionEmailService: StructureDecisionEmailService
  ) {}

  @Get("export")
  @UseGuards(OtpGuard)
  @RequireOtp("EXPORT")
  public async export(
    @CurrentSupervisor() user: UserAdminAuthenticated,
    @Res() response: ExpressResponse
  ) {
    await this.appLogsService.create({
      ...buildSupervisorActorFields(user),
      action: "EXPORT_DOMIFA",
    });

    const structures =
      await this.adminStructuresService.getAdminStructuresListData();
    const users = await this.adminStructuresService.getUsersForAdmin();
    const workbook = await statsDeploiementExporter.generateExcelDocument({
      structures,
      users,
    });

    const fileName = `${format(
      new Date(),
      "dd-MM-yyyy_HH-mm"
    )}_export-stats-deploiement.xlsx`;

    await expressResponseExcelRenderer.sendExcelWorkbook({
      res: response,
      fileName,
      workbook,
    });
  }

  @Get("")
  public async list(): Promise<StructureAdmin[]> {
    return await structureRepository.getAdminStructuresListData();
  }

  @Get("structure/:structureUuid")
  @UseGuards(StructureAccessGuard)
  public async getStructure(
    @CurrentSupervisor() _user: UserAdminAuthenticated,
    @CurrentStructure() structure: Structure
  ): Promise<Structure> {
    return await structureRepository.findOneOrFail({
      where: { id: structure.id },
    });
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: "Logs d'activité d'une structure" })
  @Get(":structureUuid/logs")
  public async getStructureLogs(
    @CurrentSupervisor() _user: UserAdminAuthenticated,
    @Param("structureUuid", new ParseUUIDPipe()) structureUuid: string,
    @Query() pageOptions: PageOptionsDto
  ) {
    const structure = await structureRepository.findOne({
      where: { uuid: structureUuid },
      select: { id: true },
    });
    if (!structure) {
      throw new NotFoundException("STRUCTURE_NOT_FOUND");
    }
    return this.appLogsService.findStructureLogs({
      structureId: structure.id,
      page: pageOptions.page,
      take: pageOptions.take,
    });
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: "Logs de sécurité d'une structure" })
  @Get(":structureUuid/security-logs")
  public async getStructureSecurityLogs(
    @CurrentSupervisor() _user: UserAdminAuthenticated,
    @Param("structureUuid", new ParseUUIDPipe()) structureUuid: string,
    @Query() pageOptions: PageOptionsDto,
    @Query("userType") userType?: string
  ) {
    const structure = await structureRepository.findOne({
      where: { uuid: structureUuid },
      select: { id: true },
    });
    if (!structure) {
      throw new NotFoundException("STRUCTURE_NOT_FOUND");
    }
    const userTypeFilter =
      userType === "user_structure" || userType === "usager"
        ? userType
        : undefined;
    return this.appLogSecurityService.findStructureSecurityLogs({
      structureId: structure.id,
      page: pageOptions.page,
      take: pageOptions.take,
      userType: userTypeFilter,
    });
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary:
      "Dernières sessions des utilisateurs d'une structure (active + historique)",
  })
  @Get(":structureUuid/sessions")
  public async getStructureSessions(
    @CurrentSupervisor() _user: UserAdminAuthenticated,
    @Param("structureUuid", new ParseUUIDPipe()) structureUuid: string
  ): Promise<StructureSessionRecord[]> {
    const structure = await structureRepository.findOne({
      where: { uuid: structureUuid },
      select: { id: true },
    });
    if (!structure) {
      throw new NotFoundException("STRUCTURE_NOT_FOUND");
    }
    return this.adminStructuresService.getStructureSessions(structure.id, 100);
  }

  @Get("structure/:structureUuid/users")
  @UseGuards(StructureAccessGuard)
  public async getUsers(
    @CurrentSupervisor() _user: UserAdminAuthenticated,
    @CurrentStructure() structure: Structure
  ): Promise<Array<UserStructureWithSecurity>> {
    const usersStructure = await userStructureSecurityRepository.query<
      UserStructureWithSecurity[]
    >(
      `
        SELECT
        user_structure.nom,
        user_structure.id,
        user_structure.prenom,
        user_structure.email,
        user_structure.role,
        user_structure.status,
        user_structure."lastLogin",
        user_structure."passwordLastUpdate",
        user_structure."createdAt",
        user_structure.uuid,
        user_structure.fonction,
        user_structure."fonctionDetail",
        uss."temporaryTokens"
        FROM user_structure_security uss
        INNER JOIN user_structure
        ON user_structure.id = uss."userId"
        WHERE user_structure."structureId" = $1
`,
      [structure.id]
    );
    return Promise.all(
      usersStructure.map(async (user) => ({
        ...user,
        remainingBackoffMinutes:
          (await userSecurityEventHistoryManager.getBackoffTime({
            userProfile: "structure",
            userId: user.id,
          })) ?? null,
      }))
    );
  }

  @Patch("structure-decision/:structureUuid")
  @UseGuards(StructureAccessGuard)
  public async updateStructureStatus(
    @CurrentSupervisor() user: UserAdminAuthenticated,
    @CurrentStructure() structure: Structure,
    @Body() updateStatusDto: UpdateStructureDecisionStatutDto,
    @Res() res: ExpressResponse
  ): Promise<ExpressResponse> {
    try {
      // Valider le motif si applicable
      const { motifLabel } = this.structureDecisionService.validateMotif(
        updateStatusDto.statut,
        updateStatusDto.statutDetail
      );

      // Construire la décision
      const decision = this.structureDecisionService.buildDecisionObject(
        updateStatusDto.statut,
        updateStatusDto.statutDetail,
        user
      );

      // Mettre à jour la structure
      await this.structureDecisionService.updateStructureStatut(
        structure.id,
        updateStatusDto.statut,
        decision
      );

      // Récupérer l'admin de la structure
      const admin = await this.structureDecisionService.getStructureAdmin(
        structure.id
      );

      // Gérer les actions selon le statut
      await this.handleStatutSpecificActions(
        updateStatusDto.statut,
        admin,
        structure,
        motifLabel,
        user.prenom
      );

      // Logger l'action
      const config = this.structureDecisionService.getStatutConfig(
        updateStatusDto.statut
      );
      await this.appLogsService.create({
        ...buildSupervisorActorFields(user),
        structureId: structure.id,
        action: config.logAction,
      });

      // Return the updated row. getAdminStructuresListData returns an array
      // even when filtered by id; the frontend stores it via NgRx updateOne
      // which matches on id, so it must receive a single object.
      const [updatedStructure] =
        await structureRepository.getAdminStructuresListData(structure.id);

      return res.status(HttpStatus.OK).json(updatedStructure);
    } catch (error) {
      console.error("INTERNAL_ERROR", error);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: "INTERNAL_SERVER_ERROR",
      });
    }
  }

  @Patch("structure-decision/:structureUuid/delete")
  @UseGuards(StructureAccessGuard, OtpGuard)
  @RequireOtp("DELETE_STRUCTURE")
  public async deleteStructure(
    @CurrentSupervisor() user: UserAdminAuthenticated,
    @CurrentStructure() structure: Structure,
    @Body() deleteDto: DeleteStructureDto,
    @Res() res: ExpressResponse
  ): Promise<ExpressResponse> {
    return this.updateStructureStatus(
      user,
      structure,
      {
        statut: "SUPPRIME",
        statutDetail: deleteDto.motif,
      },
      res
    );
  }

  @Patch("structure/:structureUuid/users/:uuid/unblock")
  @UseGuards(StructureAccessGuard, OtpGuard)
  @RequireOtp("UNBLOCK_USER")
  public async unblockStructureUser(
    @Req() req: ExpressRequest,
    @CurrentSupervisor() user: UserAdminAuthenticated,
    @CurrentStructure() structure: Structure,
    @Param("uuid", new ParseUUIDPipe()) uuid: string,
    @Body() unblockDto: UnblockUserDto,
    @Res() res: ExpressResponse
  ): Promise<ExpressResponse> {
    const requestContext = buildSecurityLogRequestContext(req);
    const { userId } = await this.adminStructuresService.unblockStructureUser(
      uuid,
      structure.id,
      requestContext
    );

    try {
      await this.appLogSecurityService.create({
        // SUBJECT = target structure user.
        userStructureId: userId,
        userType: "user_structure",
        structureId: structure.id,
        action: "UNBLOCK_USER",
        ip: requestContext.ip,
        userAgent: requestContext.userAgent,
        context: {
          motif: unblockDto.motif,
          actorSupervisorId: user.id,
          actorRole: user.role,
        },
      });
    } catch {
      // Best-effort audit: the unblock has already committed above.
    }

    return res.status(HttpStatus.OK).json({ status: "ACTIVE" });
  }

  @Patch("structure/:structureUuid/users/:uuid/block")
  @UseGuards(StructureAccessGuard)
  public async blockStructureUser(
    @Req() req: ExpressRequest,
    @CurrentSupervisor() user: UserAdminAuthenticated,
    @CurrentStructure() structure: Structure,
    @Param("uuid", new ParseUUIDPipe()) uuid: string,
    @Res() res: ExpressResponse
  ): Promise<ExpressResponse> {
    const requestContext = buildSecurityLogRequestContext(req);
    const previous = await this.adminStructuresService.blockStructureUser(
      uuid,
      structure.id
    );

    try {
      await this.appLogSecurityService.create<
        BlockUserByAdminLogContext & {
          actorSupervisorId: number;
          actorRole: string;
        }
      >({
        // SUBJECT = target structure user.
        userStructureId: previous.userId,
        userType: "user_structure",
        structureId: structure.id,
        action: "BLOCK_USER_BY_ADMIN",
        ip: requestContext.ip,
        userAgent: requestContext.userAgent,
        context: {
          previousStatus: previous.previousStatus,
          previousRole: previous.previousRole,
          actorSupervisorId: user.id,
          actorRole: user.role,
        },
      });
    } catch {
      // Best-effort audit: the block has already committed above.
    }

    return res.status(HttpStatus.OK).json({ status: "BLOCKED" });
  }

  private async handleStatutSpecificActions(
    statut: StructureDecisionStatut,
    admin: Pick<UserStructure, "prenom" | "nom" | "id" | "email">,
    structure: Pick<Structure, "id" | "uuid">,
    motifLabel: string,
    adminPrenomDecideur: string
  ): Promise<void> {
    const emailParams = {
      prenom: adminPrenomDecideur,
      motif: motifLabel,
    };

    const adminName = `${admin.prenom} ${admin.nom}`;

    if (statut === "VALIDE") {
      await this.structureDecisionService.activateAdmin(admin.id, structure.id);
    } else {
      await this.structureDecisionService.deleteStructureData(structure);
    }

    await this.structureDecisionEmailService.sendDecisionEmail(
      statut,
      admin.email,
      adminName,
      emailParams
    );
  }
}
