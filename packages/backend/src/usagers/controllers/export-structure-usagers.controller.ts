import { Controller, Get, Param, Res, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { Response } from "express";
import { CurrentUser } from "../../auth/current-user.decorator";
import { ResponsableGuard } from "../../auth/guards/responsable.guard";
import {
  structureUsagersExporter,
  StructureUsagersExportModel,
} from "../../excel/export-structure-usagers";
import { InteractionsService } from "../../interactions/interactions.service";
import { expressResponseExcelRenderer } from "../../util";
import {
  AppAuthUser,
  AppUser,
  UsagerLight,
  UserRole,
} from "../../_common/model";
import { UsagersService } from "../services/usagers.service";

import moment = require("moment");

@UseGuards(AuthGuard("jwt"), ResponsableGuard)
@ApiTags("export")
@ApiBearerAuth()
@Controller("export")
export class ExportStructureUsagersController {
  constructor(
    private readonly usagersService: UsagersService,
    private readonly interactionsService: InteractionsService
  ) {}

  @Get("")
  public async export(
    @Param("id") id: number,
    @Param("role") role: UserRole,
    @CurrentUser() user: AppAuthUser,
    @Res() res: Response
  ) {
    const model: StructureUsagersExportModel = await this.buildExportModel(
      user
    );
    const workbook = await structureUsagersExporter.generateExcelDocument(
      model
    );
    const fileName = `${moment(model.exportDate).format(
      "DD-MM-yyyy_HH-mm"
    )}_export-structure-${user.structureId}-usagers.xlsx`;
    await expressResponseExcelRenderer.sendExcelWorkbook({
      res,
      fileName,
      workbook,
    });
  }

  private async buildExportModel(user: Pick<AppUser, "structureId">) {
    const usagers = await this.usagersService.export(user.structureId);

    const usagersInteractionsCountByType: {
      [usagerRef: number]: { [interactionType: string]: number };
    } = {};

    for (let i = 0; i < usagers.length; i++) {
      const usager: UsagerLight = usagers[i];

      usagersInteractionsCountByType[usager.ref] = {
        courrierIn: await this.interactionsService.totalInteraction(
          user.structureId,
          usager.ref,
          "courrierIn"
        ),
        courrierOut: await this.interactionsService.totalInteraction(
          user.structureId,
          usager.ref,
          "courrierOut"
        ),
        recommandeIn: await this.interactionsService.totalInteraction(
          user.structureId,
          usager.ref,
          "recommandeIn"
        ),
        recommandeOut: await this.interactionsService.totalInteraction(
          user.structureId,
          usager.ref,
          "recommandeOut"
        ),
        colisIn: await this.interactionsService.totalInteraction(
          user.structureId,
          usager.ref,
          "colisIn"
        ),
        colisOut: await this.interactionsService.totalInteraction(
          user.structureId,
          usager.ref,
          "colisOut"
        ),
        appel: await this.interactionsService.totalInteraction(
          user.structureId,
          usager.ref,
          "appel"
        ),
        visite: await this.interactionsService.totalInteraction(
          user.structureId,
          usager.ref,
          "visite"
        ),
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
