import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Put,
  Res,
  UseGuards,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { AllowUserProfiles } from "../../../auth/decorators";
import { AppUserGuard } from "../../../auth/guards";
import {
  structureRepository,
  userStructureRepository,
  UserStructureTable,
} from "../../../database";
import {
  statsDeploiementExporter,
  StatsDeploiementExportModel,
} from "../../../excel/export-stats-deploiement";
import { StatsExportUser } from "../../../excel/export-stats-deploiement/StatsExportUser.type";
import { userAccountActivatedEmailSender } from "../../../mails/services/templates-renderers";
import { MessageSmsService } from "../../../sms/services/message-sms.service";
import { structureCreatorService } from "../../../structures/services/structureCreator.service";
import { StructuresService } from "../../../structures/services/structures.service";
import { expressResponseExcelRenderer } from "../../../util";
import { dataCompare } from "../../../util/dataCompare.service";
import { ExpressResponse } from "../../../util/express";
import {
  AdminStructureListData,
  AdminStructureStatsData,
  Structure,
} from "../../../_common/model";
import { AdminStructuresService } from "../services";
import moment = require("moment");
@UseGuards(AuthGuard("jwt"), AppUserGuard)
@Controller("admin/structures")
@ApiTags("dashboard")
@ApiBearerAuth()
export class AdminStructuresController {
  constructor(
    private readonly adminStructuresService: AdminStructuresService,
    private readonly structureService: StructuresService,
    private readonly messageSmsService: MessageSmsService
  ) {}

  @Get("export")
  @AllowUserProfiles("super-admin-domifa")
  public async export(@Res() res: ExpressResponse) {
    const stats: StatsDeploiementExportModel =
      await this.adminStructuresService.getStatsDeploiementForExport();

    const USER_STATS_ATTRIBUTES: (keyof StatsExportUser &
      keyof UserStructureTable)[] = [
      "id",
      "email",
      "nom",
      "prenom",
      "role",
      "verified",
      "structureId",
    ];
    const users = await userStructureRepository.findMany<
      Omit<StatsExportUser, "structure">
    >(undefined, {
      select: USER_STATS_ATTRIBUTES,
    });

    const structures: Pick<Structure, "id" | "nom">[] =
      await structureRepository.findMany({}, { select: ["id", "nom"] });

    const structuresById = structures.reduce((acc, s) => {
      acc[s.id] = s;
      return acc;
    }, {} as { [attr: string]: Pick<Structure, "id" | "nom"> });

    const usersWithStructure: StatsExportUser[] = users.map((u) => ({
      ...u,
      structure: structuresById[u.structureId],
    }));

    usersWithStructure.sort((a, b) => {
      const res = dataCompare.compareAttributes(a.nom, b.nom, {
        asc: true,
        nullFirst: false,
      });
      if (res === 0) {
        return dataCompare.compareAttributes(a.prenom, b.prenom, {
          asc: true,
          nullFirst: false,
        });
      }
      return res;
    });

    const workbook = await statsDeploiementExporter.generateExcelDocument({
      stats,
      users: usersWithStructure,
    });

    const fileName = `${moment(stats.exportDate).format(
      "DD-MM-yyyy_HH-mm"
    )}_export-stats-deploiement.xlsx`;
    await expressResponseExcelRenderer.sendExcelWorkbook({
      res,
      fileName,
      workbook,
    });
  }

  @Get("stats")
  @AllowUserProfiles("super-admin-domifa")
  public async stats(): Promise<AdminStructureStatsData> {
    const stats =
      await this.adminStructuresService.getStatsDomifaAdminDashboard();
    return stats;
  }

  @Get()
  @AllowUserProfiles("super-admin-domifa")
  public async list(): Promise<AdminStructureListData> {
    const data: AdminStructureListData =
      await this.adminStructuresService.getAdminStructuresListData();
    return data;
  }

  @AllowUserProfiles("super-admin-domifa")
  @Put("portail-usager/toggle-enable-domifa/:structureId")
  public async toggleEnablePortailUsagerByDomifa(
    @Param("structureId") structureId: number
  ) {
    const structure = await this.structureService.findOneFull(structureId);

    structure.portailUsager.enabledByDomifa =
      !structure.portailUsager.enabledByDomifa;

    if (!structure.portailUsager.enabledByDomifa) {
      structure.portailUsager.enabledByStructure = false;
    }

    return structureRepository.updateOne(
      { id: structureId },
      { portailUsager: structure.portailUsager }
    );
  }

  @AllowUserProfiles("super-admin-domifa")
  @Get("confirm/:id/:token")
  public async confirmStructureCreation(
    @Param("token") token: string,
    @Param("id") id: string,
    @Res() res: ExpressResponse
  ): Promise<any> {
    if (token === "") {
      throw new HttpException("STRUCTURE_TOKEN_EMPTY", HttpStatus.BAD_REQUEST);
    }

    const structure = await structureCreatorService.checkCreationToken({
      token,
      structureId: parseInt(id, 10),
    });

    if (!structure) {
      throw new HttpException(
        "STRUCTURE_TOKEN_INVALID",
        HttpStatus.BAD_REQUEST
      );
    } else {
      const admin = await userStructureRepository.findOne({
        role: "admin",
        structureId: structure.id,
      });

      const updatedAdmin = await userStructureRepository.updateOne(
        {
          id: admin.id,
          structureId: structure.id,
        },
        { verified: true }
      );

      await userAccountActivatedEmailSender.sendMail({ user: updatedAdmin });
      return res.status(HttpStatus.OK).json({ message: "OK" });
    }
  }
  @AllowUserProfiles("super-admin-domifa")
  @Put("sms/enable/:structureId")
  public async smsEnableByDomifa(@Param("structureId") structureId: number) {
    const structure = await this.structureService.findOneFull(structureId);

    structure.sms.enabledByDomifa = !structure.sms.enabledByDomifa;

    if (!structure.sms.enabledByDomifa) {
      structure.sms.enabledByStructure = false;
    }

    return this.messageSmsService.changeStatutByDomifa(
      structureId,
      structure.sms
    );
  }
}
