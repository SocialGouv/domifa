import { interactionRepository } from "./../../database/services/interaction/interactionRepository.service";
import { InteractionType } from "./../../_common/model/interaction/InteractionType.type";
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
  UsagerLight,
  UserStructure,
  UserStructureAuthenticated,
} from "../../_common/model";
import { UsagersService } from "../services/usagers.service";

import { startApmSpan } from "../../instrumentation";
import { format } from "date-fns";

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
    const buildModelSpan = startApmSpan("buildExportModel");
    const model: StructureUsagersExportModel = await this.buildExportModel(
      user
    );
    if (buildModelSpan) buildModelSpan.end();

    const generateExcelSpan = startApmSpan("generateExcelDocument");
    const workbook = await structureUsagersExporter.generateExcelDocument(
      model
    );
    if (generateExcelSpan) generateExcelSpan.end();

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
      [usagerRef: number]: { [interactionType in InteractionType]: number };
    } = {};

    const interactionsByUsagerMap =
      await interactionRepository.totalInteractionAllUsagersStructure({
        structureId: user.structureId,
      });

    for (let i = 0; i < usagers.length; i++) {
      const usager: UsagerLight = usagers[i];

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