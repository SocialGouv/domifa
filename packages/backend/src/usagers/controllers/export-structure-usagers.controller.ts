import { Controller, Get, Param, Res, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { Response } from "express";
import { CurrentUser } from "../../auth/current-user.decorator";
import { ResponsableGuard } from "../../auth/guards/responsable.guard";
import { UsagerLight } from "../../database";
import {
  structureUsagersExporter,
  StructureUsagersExportModel,
} from "../../excel/export-structure-usagers";
import { InteractionsService } from "../../interactions/interactions.service";
import { appLogger } from "../../util";
import { AppAuthUser, AppUser, UserRole } from "../../_common/model";
import { UsagersService } from "../services/usagers.service";

import moment = require("moment");

@UseGuards(AuthGuard("jwt"), ResponsableGuard)
@ApiTags("export")
@ApiBearerAuth()
@Controller("export")
export class ExportStructureUsagersController {
  // Données des usagers + ayant-droit
  public dataSheet1: {
    [key: string]: {};
  }[];
  // Données usagers + entretiens
  public dataSheet2: {
    [key: string]: {};
  }[];
  // Données usagers + courriers
  public dataSheet3: {
    [key: string]: {};
  }[];

  constructor(
    private readonly usagersService: UsagersService,
    private readonly interactionsService: InteractionsService
  ) {
    this.dataSheet1 = [];
    this.dataSheet2 = [];
    this.dataSheet3 = [];
  }

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
    res.header(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.header("Content-Disposition", `attachment; filename="${fileName}"`);

    await workbook.xlsx
      .write(res)
      .then(() => {
        res.end();
      })
      .catch((err) => {
        appLogger.error("Unexpected export error", err);
        res.sendStatus(500);
        res.end();
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
