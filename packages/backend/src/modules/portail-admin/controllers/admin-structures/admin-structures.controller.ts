import {
  Controller,
  Get,
  Post,
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
  userStructureRepository,
  structureRepository,
  userStructureSecurityRepository,
} from "../../../../database";
import { statsDeploiementExporter } from "../../../../excel/export-stats-deploiement";

import {
  expressResponseExcelRenderer,
  getCreatedByUserStructure,
} from "../../../../util";
import { ExpressResponse } from "../../../../util/express";
import { UserAdminAuthenticated } from "../../../../_common/model";
import { AdminStructuresService } from "../../services";

import {
  Structure,
  StructureDecisionRefusMotif,
  StructureDecisionSuppressionMotif,
} from "@domifa/common";
import { AppLogsService } from "../../../app-logs/app-logs.service";
import {
  StructureConfirmationDto,
  UpdateStructureDecisionStatutDto,
} from "../../dto";
import { StructureAdminForList, UserStructureWithSecurity } from "../../types";
import { userAccountActivatedEmailSender } from "../../../mails/services/templates-renderers";
import { structureCreatorService } from "../../../structures/services";
import { format } from "date-fns";
import { getBackoffTime } from "../../../users/services";
import { CurrentSupervisor } from "../../../../auth/decorators/current-supervisor.decorator";

@UseGuards(AuthGuard("jwt"), AppUserGuard)
@Controller("admin/structures")
@ApiTags("dashboard")
@AllowUserProfiles("supervisor")
@AllowUserSupervisorRoles("super-admin-domifa")
@ApiBearerAuth()
export class AdminStructuresController {
  constructor(
    private readonly adminStructuresService: AdminStructuresService,
    private readonly appLogsService: AppLogsService
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
    return await this.adminStructuresService.getAdminStructuresListData();
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

  @Post("confirm-structure-creation")
  public async confirmStructureCreation(
    @CurrentSupervisor() _user: UserAdminAuthenticated,
    @Body() structureConfirmationDto: StructureConfirmationDto,
    @Res() res: ExpressResponse
  ): Promise<ExpressResponse> {
    const structure = await structureCreatorService.checkCreationToken({
      token: structureConfirmationDto.token,
      uuid: structureConfirmationDto.uuid,
    });

    if (!structure) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json({ message: "STRUCTURE_TOKEN_INVALID" });
    }

    const admin = await userStructureRepository.findOneBy({
      role: "admin",
      structureId: structure.id,
    });

    await userStructureRepository.update(
      {
        id: admin.id,
        structureId: structure.id,
      },
      { verified: true }
    );

    const updatedAdmin = await userStructureRepository.findOneBy({
      id: admin.id,
      structureId: structure.id,
    });
    await userAccountActivatedEmailSender.sendMail({ user: updatedAdmin });
    await this.appLogsService.create({
      userId: _user.id,
      action: "ADMIN_STRUCTURE_VALIDATE",
    });
    return res.status(HttpStatus.OK).json({ message: "OK" });
  }

  @Patch("structure/:structureId/status")
  public async updateStructureStatus(
    @CurrentSupervisor() user: UserAdminAuthenticated,
    @Param("structureId", new ParseIntPipe()) structureId: number,
    @Body() updateStatusDto: UpdateStructureDecisionStatutDto,
    @Res() res: ExpressResponse
  ): Promise<ExpressResponse> {
    try {
      // Vérifier que la structure existe
      const structure = await structureRepository.findOneBy({
        id: structureId,
      });
      if (!structure) {
        return res.status(HttpStatus.NOT_FOUND).json({
          message: "Structure non trouvée",
        });
      }

      if (
        updateStatusDto.statut === "REFUS" &&
        !Object.values(StructureDecisionRefusMotif).includes(
          updateStatusDto.statutDetail as StructureDecisionRefusMotif
        )
      ) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          message: "INVALID_STRUCTURE_STATUT",
        });
      }

      if (
        updateStatusDto.statut === "SUPPRIME" &&
        !Object.values(StructureDecisionSuppressionMotif).includes(
          updateStatusDto.statutDetail as StructureDecisionSuppressionMotif
        )
      ) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          message: "INVALID_STRUCTURE_STATUT",
        });
      }

      await structureRepository.update(
        { id: structureId },
        {
          statut: updateStatusDto.statut,
          decision: {
            statut: updateStatusDto.statut,
            dateDecision: new Date(),
            motif: updateStatusDto?.statutDetail,
            ...getCreatedByUserStructure(user),
          },
        }
      );

      // Log de l'action admin
      await this.appLogsService.create({
        userId: user.id,
        structureId,
        action:
          updateStatusDto.statut === "REFUS"
            ? "ADMIN_STRUCTURE_REFUSAL"
            : "ADMIN_STRUCTURE_DELETE",
        context: {
          statut: updateStatusDto.statut,
          statutDetail: updateStatusDto.statutDetail,
        },
      });

      return res.status(HttpStatus.OK).json({
        structure: {
          id: structure.id,
          nom: structure.nom,
          statut: updateStatusDto.statut,
          statutDetail: updateStatusDto.statutDetail,
        },
      });
    } catch (error) {
      console.error("INTERNAL_ERROR", error);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: "INTERNAL_SERVER_ERROR",
      });
    }
  }
}
