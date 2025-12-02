import {
  Controller,
  Get,
  Body,
  HttpStatus,
  Res,
  UseGuards,
  Param,
  ParseIntPipe,
  Patch,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";

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
  StructureDecisionStatut,
  UserStructure,
} from "@domifa/common";
import { AppLogsService } from "../../../app-logs/app-logs.service";
import { UpdateStructureDecisionStatutDto } from "../../dto";
import { StructureAdminForList, UserStructureWithSecurity } from "../../types";
import { format } from "date-fns";
import { getBackoffTime } from "../../../users/services";
import { CurrentSupervisor } from "../../../../auth/decorators/current-supervisor.decorator";
import { StructureDecisionEmailService } from "../../services/structure-decision-email/structure-decision-email.service";
import { StructureDecisionService } from "../../services/structure-decision/structure-decision.service";

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
  public async export(
    @CurrentSupervisor() user: UserAdminAuthenticated,
    @Res() response: ExpressResponse
  ) {
    await this.appLogsService.create({
      userId: user.id,
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
  public async list(): Promise<StructureAdminForList[]> {
    return await structureRepository.getAdminStructuresListData();
  }

  @Get("structure/:structureId")
  @UseGuards(StructureAccessGuard)
  public async getStructure(
    @CurrentSupervisor() _user: UserAdminAuthenticated,
    @CurrentStructure() structure: Structure,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @Param("structureId") _structureId: number
  ): Promise<Structure> {
    return await structureRepository.findOneOrFail({
      where: { id: structure.id },
    });
  }

  @Get("structure/:structureId/users")
  @UseGuards(StructureAccessGuard)
  public async getUsers(
    @CurrentSupervisor() _user: UserAdminAuthenticated,
    @CurrentStructure() structure: Structure,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @Param("structureId", new ParseIntPipe()) _structureId: number
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
        user_structure.verified,
        user_structure."lastLogin",
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
      remainingBackoffMinutes: getBackoffTime(user.eventsHistory),
      ...user,
    }));
  }

  @Patch("structure-decision/:structureId")
  public async updateStructureStatus(
    @CurrentSupervisor() user: UserAdminAuthenticated,
    @Param("structureId", new ParseIntPipe()) structureId: number,
    @Body() updateStatusDto: UpdateStructureDecisionStatutDto,
    @Res() res: ExpressResponse
  ): Promise<ExpressResponse> {
    try {
      const structure = await structureRepository.findOneBy({
        id: structureId,
      });

      if (!structure) {
        return res.status(HttpStatus.NOT_FOUND).json({
          message: "BAD_REQUEST",
        });
      }

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
        structureId,
        updateStatusDto.statut,
        decision
      );

      // Récupérer l'admin de la structure
      const admin = await this.structureDecisionService.getStructureAdmin(
        structureId
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
        userId: user.id,
        action: config.logAction,
      });

      // Retourner les données mises à jour
      const updatedStructure =
        await structureRepository.getAdminStructuresListData(structureId);

      return res.status(HttpStatus.OK).json(updatedStructure);
    } catch (error) {
      console.error("INTERNAL_ERROR", error);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: "INTERNAL_SERVER_ERROR",
      });
    }
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
