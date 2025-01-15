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

      const wsUsagers = XLSX.utils.json_to_sheet([], { skipHeader: true });
      const wsEntretiens = XLSX.utils.json_to_sheet([], { skipHeader: true });

      XLSX.utils.book_append_sheet(workbook, wsUsagers, "Liste des domiciliés");
      XLSX.utils.book_append_sheet(workbook, wsEntretiens, "Entretiens");

      let currentRowUsagers = 0;
      let currentRowEntretiens = 0;

      const processChunk = async (chunk: StructureUsagerExport[]) => {
        const { firstSheetUsagers, secondSheetEntretiens } =
          renderStructureUsagersRows(chunk, user.structure);

        // Ajoute les lignes à la première feuille
        XLSX.utils.sheet_add_json(wsUsagers, firstSheetUsagers, {
          skipHeader: true,
          origin: currentRowUsagers,
        });
        currentRowUsagers += firstSheetUsagers.length;

        // Ajoute les lignes à la deuxième feuille
        XLSX.utils.sheet_add_json(wsEntretiens, secondSheetEntretiens, {
          skipHeader: true,
          origin: currentRowEntretiens,
        });
        currentRowEntretiens += secondSheetEntretiens.length;
      };

      // Lance l'export par chunks
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
      appLogger.error("[EXPORT] Unexpected error", err);
      res.sendStatus(500);
    }
  }
}
