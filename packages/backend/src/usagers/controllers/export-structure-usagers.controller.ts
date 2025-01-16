import { Controller, Get, Res, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { Response } from "express";
import { AllowUserStructureRoles } from "../../auth/decorators";
import { CurrentUser } from "../../auth/decorators/current-user.decorator";
import { AppUserGuard } from "../../auth/guards";
import { UserStructureAuthenticated } from "../../_common/model";
import { appLogger } from "../../util";
import { UsagersService } from "../services/usagers.service";

import { format } from "date-fns";
import {
  applyDateFormat,
  renderStructureUsagersHeaders,
  renderStructureUsagersRows,
  StructureUsagerExport,
} from "../services/xlsx-structure-usagers-renderer";
import * as XLSX from "xlsx";
import { AppLogsService } from "../../modules/app-logs/app-logs.service";
import { domifaConfig } from "../../config";

@UseGuards(AuthGuard("jwt"), AppUserGuard)
@ApiTags("export")
@ApiBearerAuth()
@Controller("export")
export class ExportStructureUsagersController {
  constructor(
    private readonly usagersService: UsagersService,
    private readonly appLogsService: AppLogsService
  ) {}

  @Get("")
  @AllowUserStructureRoles("responsable", "admin")
  public async export(
    @CurrentUser() user: UserStructureAuthenticated,
    @Res() res: Response
  ): Promise<void> {
    const startTime = new Date();

    try {
      await this.appLogsService.create({
        userId: user.id,
        structureId: user.structureId,
        action: "EXPORT_USAGERS",
      });

      const workbook = XLSX.utils.book_new();

      const { firstSheetHeaders, secondSheetHeaders } =
        renderStructureUsagersHeaders(user.structure);

      const usagersHeadersAoA = [
        [firstSheetHeaders[0].USAGER_CUSTOM_REF],
        Object.values(firstSheetHeaders[1]),
      ];

      const entretiensHeadersAoA = [
        [secondSheetHeaders[0].USAGER_CUSTOM_REF],
        Object.values(secondSheetHeaders[1]),
      ];

      // Créer les worksheets avec aoa_to_sheet
      const wsUsagers = XLSX.utils.aoa_to_sheet(usagersHeadersAoA, {
        cellDates: true,
        dateNF: "DD/MM/YYYY",
      });

      const wsEntretiens = XLSX.utils.aoa_to_sheet(entretiensHeadersAoA, {
        cellDates: true,
        dateNF: "DD/MM/YYYY",
      });

      XLSX.utils.book_append_sheet(workbook, wsUsagers, "Liste des domiciliés");
      XLSX.utils.book_append_sheet(workbook, wsEntretiens, "Entretiens");

      let currentRowUsagers = 2;
      let currentRowEntretiens = 2;

      const processChunk = async (chunk: StructureUsagerExport[]) => {
        console.log({
          date: new Date(),
          structureId: user.structureId,
          currentRowUsagers,
        });
        const { firstSheetUsagers, secondSheetEntretiens } =
          renderStructureUsagersRows(chunk, user.structure);

        // Application du format des dates
        applyDateFormat(firstSheetUsagers, [
          "USAGER_DATE_NAISSANCE",
          "DATE_RADIATION",
          "DATE_REFUS",
          "DATE_DEBUT_DOM",
          "DATE_FIN_DOM",
          "DATE_PREMIERE_DOM",
          "DATE_DERNIER_PASSAGE",
        ]);

        // Ajoute les lignes à la première feuille
        XLSX.utils.sheet_add_json(wsUsagers, firstSheetUsagers, {
          skipHeader: true,
          origin: currentRowUsagers,
          cellDates: true,
          dateNF: "DD/MM/YYYY",
        });
        currentRowUsagers += firstSheetUsagers.length;

        applyDateFormat(secondSheetEntretiens, ["USAGER_DATE_NAISSANCE"]);

        XLSX.utils.sheet_add_json(wsEntretiens, secondSheetEntretiens, {
          skipHeader: true,
          origin: currentRowEntretiens,
          cellDates: true,
          dateNF: "DD/MM/YYYY",
        });

        currentRowEntretiens += secondSheetEntretiens.length;
      };

      await this.usagersService.exportByChunks(
        user.structureId,
        5000,
        processChunk
      );

      const buffer = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "buffer",
        ignoreEC: true,
        compression: true,
        WTF: false,
      });

      appLogger.info(
        `[EXPORT] [${domifaConfig().envId}] completed in ${
          Date.now() - startTime.getTime()
        }ms`
      );

      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="Export DomiFa ${format(
          new Date(),
          "dd-MM-yyyy"
        )}"`
      );

      res.send(buffer);
    } catch (err) {
      console.log(err);
      appLogger.error("[EXPORT] Unexpected error", err);
      res.sendStatus(500);
    }
  }
}
