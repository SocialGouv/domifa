import {
  Controller,
  Get,
  Param,
  ParseEnumPipe,
  Res,
  UseGuards,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { Response } from "express";
import {
  AllowUserProfiles,
  AllowUserStructureRoles,
} from "../../auth/decorators";
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
} from "../utils/xlsx-structure-usagers-renderer";
import * as XLSX from "xlsx";
import { AppLogsService } from "../../modules/app-logs/app-logs.service";
import { domifaConfig } from "../../config";

import { UsagersFilterCriteriaStatut } from "@domifa/common";
import { userStructureRepository } from "../../database";

let lastCpuUsage = process.cpuUsage();
let lastTime = Date.now();

const logProcessState = (label: string) => {
  const used = process.memoryUsage();
  const currentCpu = process.cpuUsage();
  const currentTime = Date.now();

  // Calcul du temps écoulé en microseconds
  const elapsedTime = (currentTime - lastTime) * 1000; // conversion en microsecondes

  // Différence avec la mesure précédente
  const userDiff = currentCpu.user - lastCpuUsage.user;
  const systemDiff = currentCpu.system - lastCpuUsage.system;

  // Calcul du pourcentage (temps CPU / temps écoulé)
  const userPercent = Math.round((userDiff / elapsedTime) * 100);
  const systemPercent = Math.round((systemDiff / elapsedTime) * 100);

  const processInfo = {
    État: label,
    Heure: new Date().toISOString(),
    Mémoire: `${Math.round(used.rss / 1024 / 1024)} Mo`,
    "CPU User": `${userPercent}%`,
    "CPU System": `${systemPercent}%`,
  };

  console.table(processInfo);
  lastCpuUsage = currentCpu;
  lastTime = currentTime;
};

@UseGuards(AuthGuard("jwt"), AppUserGuard)
@AllowUserProfiles("structure")
@AllowUserStructureRoles("responsable", "admin")
@ApiTags("export")
@ApiBearerAuth()
@Controller("export")
export class ExportStructureUsagersController {
  constructor(
    private readonly usagersService: UsagersService,
    private readonly appLogsService: AppLogsService
  ) {}

  @Get(":statut")
  public async export(
    @CurrentUser() user: UserStructureAuthenticated,
    @Res() res: Response,
    @Param("statut", new ParseEnumPipe(UsagersFilterCriteriaStatut))
    statut: UsagersFilterCriteriaStatut
  ): Promise<void> {
    const startTime = new Date();
    logProcessState("Export started");

    try {
      await this.appLogsService.create({
        userId: user.id,
        structureId: user.structureId,
        action: "EXPORT_USAGERS",
      });

      const workbook = XLSX.utils.book_new();

      const users = await userStructureRepository.getVerifiedUsersByStructureId(
        user.structureId
      );
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

      let processChunk = async (
        chunk: StructureUsagerExport[],
        count: number
      ) => {
        logProcessState(`Processing chunk (${currentRowUsagers}/${count})`);

        const { firstSheetUsagers, secondSheetEntretiens } =
          renderStructureUsagersRows(chunk, user.structure, users);

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

        logProcessState(`Apply date format to first Sheet`);

        XLSX.utils.sheet_add_json(wsUsagers, firstSheetUsagers, {
          skipHeader: true,
          origin: currentRowUsagers,
          cellDates: true,
          dateNF: "DD/MM/YYYY",
        });

        currentRowUsagers += firstSheetUsagers.length;
        firstSheetUsagers.length = 0;

        applyDateFormat(secondSheetEntretiens, ["USAGER_DATE_NAISSANCE"]);

        XLSX.utils.sheet_add_json(wsEntretiens, secondSheetEntretiens, {
          skipHeader: true,
          origin: currentRowEntretiens,
          cellDates: true,
          dateNF: "DD/MM/YYYY",
        });

        currentRowEntretiens += secondSheetEntretiens.length;
        secondSheetEntretiens.length = 0;

        logProcessState(`XLSX.utils.sheet_add_json for second sheet done`);
      };

      logProcessState(`Call to exportByChunks`);

      await this.usagersService.exportByChunks(
        user,
        2000,
        statut,
        processChunk
      );

      // Clean some memory
      wsUsagers.length = 0;
      wsEntretiens.length = 0;
      firstSheetHeaders.length = 0;
      secondSheetHeaders.length = 0;
      processChunk = null;

      logProcessState(`✅ exportByChunks Done`);
      logProcessState(`Start  XLSX.write`);

      const buffer = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "buffer",
        ignoreEC: true,
        compression: true,
        WTF: false,
      });

      logProcessState(`✅  XLSX.write DONE, buffer is ready`);

      appLogger.info(
        `[EXPORT] [${domifaConfig().envId}] completed in ${
          Date.now() - startTime.getTime()
        }ms`
      );

      logProcessState(`Ready to send buffer`);

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
