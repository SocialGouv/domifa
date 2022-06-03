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
import { InteractionsService } from "../../interactions/services";
import { expressResponseExcelRenderer } from "../../util";
import {
  UsagerLight,
  UserStructure,
  UserStructureAuthenticated,
} from "../../_common/model";
import { UsagersService } from "../services/usagers.service";

import moment = require("moment");
import { startApmSpan } from "../../instrumentation";

@UseGuards(AuthGuard("jwt"), AppUserGuard)
@ApiTags("export")
@ApiBearerAuth()
@Controller("export")
export class ExportStructureUsagersController {
  constructor(
    private readonly usagersService: UsagersService,
    private readonly interactionsService: InteractionsService
  ) {}

  @Get("")
  @AllowUserStructureRoles("responsable", "admin")
  public async export(
    @CurrentUser() user: UserStructureAuthenticated,
    @Res() res: Response
  ) {
    const buildModelSpan = startApmSpan('buildExportModel');
    const model: StructureUsagersExportModel = await this.buildExportModel(
      user
    );
    if (buildModelSpan) buildModelSpan.end();

    const generateExcelSpan = startApmSpan('generateExcelDocument');
    const workbook = await structureUsagersExporter.generateExcelDocument(
      model
    );
    if (generateExcelSpan) generateExcelSpan.end();

    const fileName = `${moment(model.exportDate).format(
      "DD-MM-yyyy_HH-mm"
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
      [usagerRef: number]: { [interactionType: string]: number };
    } = {};

    const interactionsByUsagerMap =
      await this.interactionsService.totalInteractionAllUsagersStructure({
        structureId: user.structureId,
      });

    for (let i = 0; i < usagers.length; i++) {
      const usager: UsagerLight = usagers[i];

      const data = interactionsByUsagerMap.find(
        (x) => x.usagerRef === usager.ref
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
          visite: 0,
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
