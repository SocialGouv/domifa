import { Controller, Get, Res, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { Response } from "express";
import { AllowUserStructureRoles } from "../../auth/decorators";
import { CurrentUser } from "../../auth/decorators/current-user.decorator";
import { AppUserGuard } from "../../auth/guards";
import {
  StructureUsagersExportModel,
  structureUsagersExporter,
} from "../../excel/export-structure-usagers";

import { UserStructure, UserStructureAuthenticated } from "../../_common/model";
import { expressResponseExcelRenderer } from "../../util";
import { UsagersService } from "../services/usagers.service";

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
    console.log("\nexport - " + new Date());
    formatMemoryUsage();
    const model: StructureUsagersExportModel = await this.buildExportModel(
      user
    );
    console.log("\nbuildExportModel - " + new Date());
    formatMemoryUsage();

    const workbook = await structureUsagersExporter.generateExcelDocument(
      model
    );
    console.log("\ngenerateExcelDocument - " + new Date());
    formatMemoryUsage();

    const fileName = `${format(
      model.exportDate,
      "dd-MM-yyyy_HH-mm"
    )}_export-structure-${user.structureId}-usagers.xlsx`;
    await expressResponseExcelRenderer.sendExcelWorkbook({
      res,
      fileName,
      workbook,
    });

    console.log("sendExcelWorkbook - " + new Date());
    formatMemoryUsage();
  }

  private async buildExportModel(user: Pick<UserStructure, "structureId">) {
    const usagers = await this.usagersService.export(user.structureId);

    const model: StructureUsagersExportModel = {
      exportDate: new Date(),
      usagers,
    };
    return model;
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
