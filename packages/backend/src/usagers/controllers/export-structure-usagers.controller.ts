import { Controller, Get, Param, Res, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

import { CurrentUser } from "../../auth/current-user.decorator";

import { User } from "../../users/user.interface";
import { UsagersService } from "../services/usagers.service";
import { Usager } from "../interfaces/usagers";

import { Response } from "express";

import { InteractionsService } from "../../interactions/interactions.service";
import { ResponsableGuard } from "../../auth/guards/responsable.guard";
import { ApiTags, ApiBearerAuth } from "@nestjs/swagger";
import { UserRole } from "../../users/user-role.type";
import {
  structureUsagersExporter,
  StructureUsagersExportModel,
} from "../../excel/export-structure-usagers";
import moment = require("moment");
import { appLogger } from "../../util";

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
    @CurrentUser() user: User,
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

  private async buildExportModel(user: User) {
    const usagers = await this.usagersService.export(user.structureId);

    const usagersInteractionsCountByType: {
      [usagerId: string]: { [interactionType: string]: number };
    } = {};

    for (let i = 0; i < usagers.length; i++) {
      const usager: Usager = usagers[i];

      usagersInteractionsCountByType[usager.id] = {
        courrierIn: await this.interactionsService.totalInteraction(
          user.structureId,
          usager.id,
          "courrierIn"
        ),
        courrierOut: await this.interactionsService.totalInteraction(
          user.structureId,
          usager.id,
          "courrierOut"
        ),
        recommandeIn: await this.interactionsService.totalInteraction(
          user.structureId,
          usager.id,
          "recommandeIn"
        ),
        recommandeOut: await this.interactionsService.totalInteraction(
          user.structureId,
          usager.id,
          "recommandeOut"
        ),
        colisIn: await this.interactionsService.totalInteraction(
          user.structureId,
          usager.id,
          "colisIn"
        ),
        colisOut: await this.interactionsService.totalInteraction(
          user.structureId,
          usager.id,
          "colisOut"
        ),
        appel: await this.interactionsService.totalInteraction(
          user.structureId,
          usager.id,
          "appel"
        ),
        visite: await this.interactionsService.totalInteraction(
          user.structureId,
          usager.id,
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
