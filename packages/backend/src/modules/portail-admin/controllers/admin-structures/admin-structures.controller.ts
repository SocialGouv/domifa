import {
  Controller,
  Get,
  Body,
  HttpStatus,
  Query,
  Res,
  UseGuards,
  Param,
  ParseIntPipe,
  Patch,
} from "@nestjs/common";
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
  UserStructure,
} from "@domifa/common";
import { AppLogsService } from "../../../app-logs/app-logs.service";
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
  @Get(":structureId/logs")
  public async getStructureLogs(
    @CurrentSupervisor() _user: UserAdminAuthenticated,
    @Param("structureId", new ParseIntPipe()) structureId: number,
    @Query() pageOptions: PageOptionsDto
  ) {
    return this.appLogsService.findStructureLogs({
      structureId,
      page: pageOptions.page,
      take: pageOptions.take,
    });
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
        uss."temporaryTokens",
        uss."eventsHistory"
        FROM user_structure_security uss
        INNER JOIN user_structure
        ON user_structure.id = uss."userId"
        WHERE user_structure."structureId" = $1
`,
      [structure.id]
    );
    return usersStructure.map((user) => ({
      ...user,
      remainingBackoffMinutes:
        userSecurityEventHistoryManager.getBackoffTime(user.eventsHistory) ??
        null,
    }));
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

      // Retourner les données mises à jour
      const updatedStructure =
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

  @Patch("structure/:structureUuid/users/:userId/unblock")
  @UseGuards(StructureAccessGuard, OtpGuard)
  @RequireOtp("UNBLOCK_USER")
  public async unblockStructureUser(
    @CurrentSupervisor() user: UserAdminAuthenticated,
    @CurrentStructure() structure: Structure,
    @Param("userId", new ParseIntPipe()) userId: number,
    @Body() unblockDto: UnblockUserDto,
    @Res() res: ExpressResponse
  ): Promise<ExpressResponse> {
    await this.adminStructuresService.unblockStructureUser(
      userId,
      structure.id
    );

    await this.appLogsService.create({
      ...buildSupervisorActorFields(user),
      structureId: structure.id,
      action: "UNBLOCK_USER",
      context: {
        userId,
        userProfile: "structure",
        motif: unblockDto.motif,
      },
    });

    return res.status(HttpStatus.OK).json({ status: "ACTIVE" });
  }

  @Patch("structure/:structureUuid/users/:userId/block")
  @UseGuards(StructureAccessGuard)
  public async blockStructureUser(
    @CurrentSupervisor() user: UserAdminAuthenticated,
    @CurrentStructure() structure: Structure,
    @Param("userId", new ParseIntPipe()) userId: number,
    @Res() res: ExpressResponse
  ): Promise<ExpressResponse> {
    await this.adminStructuresService.blockStructureUser(userId, structure.id);

    await this.appLogsService.create({
      ...buildSupervisorActorFields(user),
      structureId: structure.id,
      action: "BLOCK_USER_BY_ADMIN",
      context: { userId, userProfile: "structure" },
    });

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
