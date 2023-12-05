import { interactionRepository } from "./../../database/services/interaction/interactionRepository.service";

import { Controller, Get, Res, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { Response } from "express";
import { AllowUserStructureRoles } from "../../auth/decorators";
import { CurrentUser } from "../../auth/decorators/current-user.decorator";
import { AppUserGuard } from "../../auth/guards";
import {
  structureUsagersExporter,
  StructureUsagersExportModel,
} from "../../excel/export-structure-usagers";

import { expressResponseExcelRenderer } from "../../util";
import {
  Usager,
  UserStructure,
  UserStructureAuthenticated,
} from "../../_common/model";
import { UsagersService } from "../services/usagers.service";

import { format } from "date-fns";
import { InteractionType } from "@domifa/common";
import { userUsagerLoginRepository } from "../../database";

@UseGuards(AuthGuard("jwt"), AppUserGuard)
@ApiTags("export")
@ApiBearerAuth()
@Controller("export")
export class ExportStructureUsagersController {
  constructor(private readonly usagersService: UsagersService) {}

  @Get("")
  @AllowUserStructureRoles("responsable", "admin")
  public async export(
    @CurrentUser() user: UserStructureAuthenticated,
    @Res() res: Response
  ) {
    const model: StructureUsagersExportModel = await this.buildExportModel(
      user
    );

    const workbook = await structureUsagersExporter.generateExcelDocument(
      model
    );

    const fileName = `${format(
      model.exportDate,
      "dd-MM-yyyy_HH-mm"
    )}_export-structure-${user.structureId}-usagers.xlsx`;
    await expressResponseExcelRenderer.sendExcelWorkbook({
      res,
      fileName,
      workbook,
    });
  }

  private async buildExportModel(user: Pick<UserStructure, "structureId">) {
    const usagers = await this.usagersService.export(user.structureId);

    const usagersInteractionsCountByType: {
      [usagerRef: number]: {
        [interactionType in InteractionType | "loginPortail"]: number;
      };
    } = {};

    const interactionsByUsagerMap =
      await interactionRepository.totalInteractionAllUsagersStructure({
        structureId: user.structureId,
      });

    const userUsagerLoginByUsagerMap =
      await userUsagerLoginRepository.totalLoginAllUsagersStructure(
        user.structureId
      );

    for (const element of usagers) {
      const usager: Usager = element;
      const data = interactionsByUsagerMap.find(
        (x: {
          usagerRef: number;
          appel: number;
          visite: number;
          courrierIn: number;
          courrierOut: number;
          recommandeIn: number;
          recommandeOut: number;
          colisIn: number;
          colisOut: number;
        }) => x.usagerRef === usager.ref
      );

      const userUsagerLogin = userUsagerLoginByUsagerMap.find(
        (x: { usagerUUID: string; total: string }) =>
          x.usagerUUID === usager.uuid
      );

      const loginPortail = userUsagerLogin
        ? parseInt(userUsagerLogin.total, 10)
        : 0;

      usagersInteractionsCountByType[usager.ref] = {
        courrierIn: data?.courrierIn ?? 0,
        courrierOut: data?.courrierOut ?? 0,
        recommandeIn: data?.recommandeIn ?? 0,
        recommandeOut: data?.recommandeOut ?? 0,
        colisIn: data?.colisIn ?? 0,
        colisOut: data?.colisOut ?? 0,
        appel: data?.appel ?? 0,
        loginPortail,
        visite: 0,
      };
    }

    const model: StructureUsagersExportModel = {
      exportDate: new Date(),
      usagers,
      usagersInteractionsCountByType,
    };
    return model;
  }
}
