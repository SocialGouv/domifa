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
  AllowUserSupervisorRoles,
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
  UserSecurityEvent,
  UserTokens,
} from "../../../../_common/model";
import { AdminStructuresService } from "../../services";

import { Structure, UserStructure } from "@domifa/common";
import { AppLogsService } from "../../../app-logs/app-logs.service";
import { StructureConfirmationDto } from "../../dto";
import { StructureAdminForList } from "../../types";
import { userAccountActivatedEmailSender } from "../../../mails/services/templates-renderers";
import { structureCreatorService } from "../../../structures/services";
import { format } from "date-fns";

export type UserStructureWithSecurity = UserStructure & {
  temporaryTokens: UserTokens;
  events: UserSecurityEvent;
};
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
    @CurrentUser() user: UserAdminAuthenticated,
    @Res() response: ExpressResponse
  ) {
    await this.appLogsService.create({
      userId: user.id,
      structureId: 1, // TODO: update this with new user system
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
        WHERE user_structure."structureId" = $1
`,
      [structure.id]
    )) as unknown as UserStructureWithSecurity[];
  }

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
}
