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
import { renderStructureUsagersExcel } from "../services/xlsx-structure-usagers-renderer";
import { AppLogsService } from "../../modules/app-logs/app-logs.service";

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
  ) {
    await this.appLogsService.create({
      userId: user.id,
      structureId: user.structureId,
      action: "EXPORT_USAGERS",
    });

    console.log("\nexport - " + new Date());
    formatMemoryUsage();
    const usagers = await this.usagersService.export(user.structureId);

    console.log("\nrenderStructureUsagersExcel - " + new Date());
    formatMemoryUsage();

    const workbook = renderStructureUsagersExcel(usagers, user.structure);
    console.log("\nsetHeader - " + new Date());
    formatMemoryUsage();
    try {
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

      res.send(workbook);
      res.end();
    } catch (err) {
      appLogger.error("Unexpected export error", err);
      res.sendStatus(500);
      res.end();
    }
  }
}

export function formatMemoryUsage() {
  const memoryUsage = process.memoryUsage();

  const formatted = {};
  for (const key in memoryUsage) {
    formatted[key] = (memoryUsage[key] / 1024 / 1024).toFixed(2) + " MB";
  }
  console.log();
  console.log(formatted);
}
