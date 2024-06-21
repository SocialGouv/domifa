import { StructureConfirmationDto } from "./../../_dto/StructureConfirmationDto";
import {
  Controller,
  Get,
  Post,
  Body,
  HttpStatus,
  Res,
  UseGuards,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";

import { AllowUserProfiles } from "../../../auth/decorators";
import { AppUserGuard } from "../../../auth/guards";
import {
  userStructureRepository,
  structureRepository,
  UserStructureTable,
} from "../../../database";
import {
  statsDeploiementExporter,
  StatsDeploiementExportModel,
} from "../../../excel/export-stats-deploiement";
import { StatsExportUser } from "../../../excel/export-stats-deploiement/StatsExportUser.type";
import { userAccountActivatedEmailSender } from "../../../mails/services/templates-renderers";

import { expressResponseExcelRenderer } from "../../../util";
import { dataCompare } from "../../../util/dataCompare.service";
import { ExpressResponse } from "../../../util/express";
import {
  AdminStructureListData,
  StructureAdmin,
  UserAdminAuthenticated,
  UserStructureAuthenticated,
} from "../../../_common/model";
import { AdminStructuresService } from "../services";
import { CurrentUser } from "../../../auth/decorators/current-user.decorator";
import { UsersController } from "../../../users/users.controller";
import { RegisterUserAdminDto } from "../../../users/dto";
import { format } from "date-fns";
import { structureCreatorService } from "../../../structures/services";
import {
  AdminStructureStatsData,
  DEPARTEMENTS_MAP,
  REGIONS_LISTE,
  Structure,
} from "@domifa/common";
import { MetabaseStatsDto } from "../../_dto/MetabaseStats.dto";
import { domifaConfig } from "../../../config";
import jwt from "jsonwebtoken";
import { FindOptionsWhere } from "typeorm";
import { AppLogsService } from "../../../modules/app-logs/app-logs.service";

@UseGuards(AuthGuard("jwt"), AppUserGuard)
@Controller("admin/structures")
@ApiTags("dashboard")
@ApiBearerAuth()
export class AdminStructuresController {
  constructor(
    private readonly adminStructuresService: AdminStructuresService,
    private readonly appLogsService: AppLogsService
  ) {}

  @Get("export")
  @AllowUserProfiles("super-admin-domifa")
  public async export(
    @CurrentUser() { user }: UserAdminAuthenticated,
    @Res() response: ExpressResponse
  ) {
    await this.appLogsService.create({
      userId: user.id,
      structureId: user.structureId,
      action: "EXPORT_DOMIFA",
    });

    const {
      structures,
      stats,
    }: {
      structures: StructureAdmin[];
      stats: StatsDeploiementExportModel;
    } = await this.adminStructuresService.getStatsDeploiementForExport();

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

    const users = await userStructureRepository.find({
      where: {},
      select: USER_STATS_ATTRIBUTES,
    });

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

    const fileName = `${format(
      stats.exportDate,
      "dd-MM-yyyy_HH-mm"
    )}_export-stats-deploiement.xlsx`;

    await expressResponseExcelRenderer.sendExcelWorkbook({
      res: response,
      fileName,
      workbook,
    });
  }

  @Get("stats")
  @AllowUserProfiles("super-admin-domifa")
  public async stats(): Promise<AdminStructureStatsData> {
    return this.adminStructuresService.getStatsDomifaAdminDashboard();
  }

  @Get("")
  @AllowUserProfiles("super-admin-domifa")
  public async list(): Promise<AdminStructureListData> {
    const data: AdminStructureListData =
      await this.adminStructuresService.getAdminStructuresListData();
    return data;
  }

  @AllowUserProfiles("super-admin-domifa")
  @Post("confirm-structure-creation")
  public async confirmStructureCreation(
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

    return res.status(HttpStatus.OK).json({ message: "OK" });
  }

  @AllowUserProfiles("super-admin-domifa")
  @Post("register-new-admin")
  public async registerNewAdmin(
    @CurrentUser() user: UserStructureAuthenticated,
    @Res() res: ExpressResponse,
    @Body() registerUserDto: RegisterUserAdminDto
  ): Promise<ExpressResponse> {
    const userController = new UsersController();
    return userController.registerUser(user, res, registerUserDto);
  }

  @AllowUserProfiles("super-admin-domifa")
  @Post("metabase-stats")
  public async getMetabaseStats(
    @CurrentUser() { user }: UserAdminAuthenticated,
    @Body() metabaseDto: MetabaseStatsDto
  ): Promise<{ url: string }> {
    await this.appLogsService.create({
      userId: user.id,
      structureId: user.structureId,
      action: "GET_STATS_PORTAIL_ADMIN",
    });

    const METABASE_SITE_URL =
      "https://metabase-domifa.ovh.fabrique.social.gouv.fr";

    const year = metabaseDto.year ? [metabaseDto.year] : null;
    let region = metabaseDto.region
      ? [REGIONS_LISTE[metabaseDto.region]]
      : null;
    let department = metabaseDto.department
      ? [DEPARTEMENTS_MAP[metabaseDto.department].departmentName]
      : null;
    const structureId = metabaseDto.structureId
      ? [metabaseDto.structureId]
      : null;
    const structureType = metabaseDto.structureType
      ? [metabaseDto.structureType]
      : null;

    if (region) {
      department = null;
    }

    if (department) {
      region = null;
    }
    const payload = {
      resource: { dashboard: 6 },
      params: {
        "ann%C3%A9e_du_rapport": year,
        "r%C3%A9gion": region,
        "d%C3%A9partement": department,
        type_de_structure: structureType,
        structureid: structureId,
      },
      exp: Math.round(Date.now() / 1000) + 10 * 60, // 10 minute expiration
    };

    const token = jwt.sign(payload, domifaConfig().metabaseToken);

    const url =
      METABASE_SITE_URL +
      "/embed/dashboard/" +
      token +
      "#bordered=false&titled=false";

    return { url };
  }

  @AllowUserProfiles("super-admin-domifa")
  @Post("metabase-get-structures")
  public async getStructures(
    @Body() metabaseDto: MetabaseStatsDto
  ): Promise<Array<Partial<Structure>>> {
    const params: FindOptionsWhere<Structure> = {
      region: metabaseDto?.region ?? undefined,
      departement: metabaseDto?.department ?? undefined,
      structureType: metabaseDto?.structureType ?? undefined,
      verified: true,
    };

    return structureRepository.find({
      where: params,
      select: ["id", "nom", "ville", "codePostal"],
      order: {
        codePostal: "ASC",
        ville: "ASC",
        nom: "ASC",
      },
    });
  }
}
