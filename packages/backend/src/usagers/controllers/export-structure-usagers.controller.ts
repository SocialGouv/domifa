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
          npai: number;
          loginPortail: number;
        }) => x.usagerRef === usager.ref
      );

      if (data) {
        usagersInteractionsCountByType[usager.ref] = {
          courrierIn: data.courrierIn,
          courrierOut: data.courrierOut,
          recommandeIn: data.recommandeIn,
          recommandeOut: data.recommandeOut,
          colisIn: data.colisIn,
          colisOut: data.colisOut,
          appel: data.appel,
          visite: data.visite,
          loginPortail: data.loginPortail,
          npai: data.npai,
        };
      } else {
        usagersInteractionsCountByType[usager.ref] = {
          courrierIn: 0,
          courrierOut: 0,
          recommandeIn: 0,
          recommandeOut: 0,
          colisIn: 0,
          colisOut: 0,
          appel: 0,
          loginPortail: 0,
          visite: 0,
          npai: 0,
        };
      }
    }

    const model: StructureUsagersExportModel = {
      exportDate: new Date(),
      usagers,
      usagersInteractionsCountByType,
    };
    return model;
  }
}
