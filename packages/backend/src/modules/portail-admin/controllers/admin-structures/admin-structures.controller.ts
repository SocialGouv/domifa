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
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";

import {
  AllowUserProfiles,
  CurrentStructure,
  CurrentUser,
} from "../../../../auth/decorators";
import { AppUserGuard, StructureAccessGuard } from "../../../../auth/guards";
import {
  userStructureRepository,
  structureRepository,
  userStructureSecurityRepository,
} from "../../../../database";
import { statsDeploiementExporter } from "../../../../excel/export-stats-deploiement";

import { expressResponseExcelRenderer } from "../../../../util";
import { ExpressResponse } from "../../../../util/express";
import {
  UserAdminAuthenticated,
  UserStructureAuthenticated,
  UserStructureSecurityEvent,
  UserStructureTokens,
} from "../../../../_common/model";
import { AdminStructuresService } from "../../services";

import {
  DEPARTEMENTS_MAP,
  REGIONS_LISTE,
  Structure,
  UserStructure,
} from "@domifa/common";
import { MetabaseStatsDto } from "../../_dto/MetabaseStats.dto";
import { domifaConfig } from "../../../../config";
import { sign } from "jsonwebtoken";
import { FindOptionsWhere } from "typeorm";
import { AppLogsService } from "../../../app-logs/app-logs.service";
import { StructureConfirmationDto } from "../../_dto";
import { StructureAdminForList } from "../../types";
import { userAccountActivatedEmailSender } from "../../../mails/services/templates-renderers";
import { structureCreatorService } from "../../../../structures/services";
import { format } from "date-fns";
import { RegisterUserAdminDto } from "../../../../users/dto";
import { UsersController } from "../../../../users/controllers/users.controller";

export type UserStructureWithSecurity = UserStructure & {
  temporaryTokens: UserStructureTokens;
  events: UserStructureSecurityEvent;
};
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

  @Get("last-update")
  @AllowUserProfiles("super-admin-domifa")
  public async getLastUpdate(): Promise<Date | null> {
    const lastUsager = await structureRepository.findOne({
      where: {},
      order: { createdAt: "DESC" },
    });
    return lastUsager?.createdAt ?? null;
  }

  @Get("")
  @AllowUserProfiles("super-admin-domifa")
  public async list(): Promise<StructureAdminForList[]> {
    return await this.adminStructuresService.getAdminStructuresListData();
  }

  @Get("structure/:structureId")
  @UseGuards(StructureAccessGuard)
  @AllowUserProfiles("super-admin-domifa")
  public async getStructure(
    @CurrentUser() _user: UserAdminAuthenticated,
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
  @AllowUserProfiles("super-admin-domifa")
  public async getUsers(
    @CurrentUser() _user: UserAdminAuthenticated,
    @CurrentStructure() structure: Structure,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @Param("structureId", new ParseIntPipe()) _structureId: number
  ): Promise<Array<UserStructureWithSecurity>> {
    return (await userStructureSecurityRepository.query(
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
        uss."temporaryTokens",
        uss."eventsHistory"
        FROM user_structure_security uss
        INNER JOIN user_structure
        ON user_structure.id = uss."userId"
        WHERE uss."structureId" = $1
`,
      [structure.id]
    )) as unknown as UserStructureWithSecurity[];
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
    return await userController.registerUser(user, res, registerUserDto);
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

    const METABASE_URL = domifaConfig().metabase.url;

    const year = metabaseDto.year ? [metabaseDto.year] : [];
    let region = metabaseDto.region ? [REGIONS_LISTE[metabaseDto.region]] : [];
    let department = metabaseDto.department
      ? [DEPARTEMENTS_MAP[metabaseDto.department].departmentName]
      : [];
    const structureId = metabaseDto.structureId
      ? [metabaseDto.structureId]
      : [];
    const structureType = metabaseDto.structureType
      ? [metabaseDto.structureType]
      : [];

    if (region.length > 0) {
      department = [];
    }

    if (department.length > 0) {
      region = [];
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
      exp: Math.round(Date.now() / 1000) + 100 * 60,
    };

    const token = sign(payload, domifaConfig().metabase.token);
    const url = `${METABASE_URL}embed/dashboard/${token}#bordered=false&titled=false`;

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

    return await structureRepository.find({
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
