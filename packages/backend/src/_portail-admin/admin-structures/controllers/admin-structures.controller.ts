import { StructureConfirmationDto } from "./../../_dto/StructureConfirmationDto";
import {
  Controller,
  Get,
  Post,
  Body,
  HttpStatus,
  Param,
  Put,
  Res,
  UseGuards,
  ParseIntPipe,
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
import { MessageSmsService } from "../../../sms/services/message-sms.service";

import { StructuresService } from "../../../structures/services/structures.service";
import { expressResponseExcelRenderer } from "../../../util";
import { dataCompare } from "../../../util/dataCompare.service";
import { ExpressResponse } from "../../../util/express";
import {
  AdminStructureListData,
  AdminStructureStatsData,
  Structure,
  StructureAdmin,
  UserStructureAuthenticated,
} from "../../../_common/model";
import { AdminStructuresService } from "../services";
import { CurrentUser } from "../../../auth/decorators/current-user.decorator";
import { AppLogsService } from "../../../modules/app-logs/app-logs.service";
import { UsersController } from "../../../users/users.controller";
import { RegisterUserAdminDto } from "../../../users/dto";
import { format } from "date-fns";
import { structureCreatorService } from "../../../structures/services";

@UseGuards(AuthGuard("jwt"), AppUserGuard)
@Controller("admin/structures")
@ApiTags("dashboard")
@ApiBearerAuth()
export class AdminStructuresController {
  constructor(
    private readonly adminStructuresService: AdminStructuresService,
    private readonly structureService: StructuresService,
    private readonly messageSmsService: MessageSmsService,
    private readonly appLogsService: AppLogsService
  ) {}

  @Get("export")
  @AllowUserProfiles("super-admin-domifa")
  public async export(@Res() response: ExpressResponse) {
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
  @Put("portail-usager/toggle-enable-domifa/:structureId")
  public async toggleEnablePortailUsagerByDomifa(
    @Param("structureId", new ParseIntPipe()) structureId: number
  ) {
    const structure = await this.structureService.findOneFull(structureId);

    structure.portailUsager.enabledByDomifa =
      !structure.portailUsager.enabledByDomifa;

    if (!structure.portailUsager.enabledByDomifa) {
      structure.portailUsager.enabledByStructure = false;
    }

    await structureRepository.update(
      { id: structureId },
      { portailUsager: structure.portailUsager }
    );
    return structureRepository.findOneBy({ id: structureId });
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
  @Put("sms/enable/:structureId")
  public async smsEnableByDomifa(
    @Param("structureId", new ParseIntPipe()) structureId: number,
    @CurrentUser() user: UserStructureAuthenticated
  ) {
    const structure = await this.structureService.findOneFull(structureId);

    structure.sms.enabledByDomifa = !structure.sms.enabledByDomifa;

    if (!structure.sms.enabledByDomifa) {
      structure.sms.enabledByStructure = false;
    }

    const action =
      structure.sms.enabledByDomifa && structure.sms.enabledByStructure
        ? "ENABLE_SMS_BY_DOMIFA"
        : "DISABLE_SMS_BY_DOMIFA";

    this.appLogsService.create({
      userId: user._userId,
      usagerRef: null,
      structureId,
      action,
    });

    return this.messageSmsService.changeStatutByDomifa(
      structureId,
      structure.sms
    );
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
}
