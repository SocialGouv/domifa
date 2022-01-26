import {
  UseGuards,
  Controller,
  Get,
  Param,
  Res,
  HttpStatus,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ApiTags, ApiBearerAuth } from "@nestjs/swagger";
import path = require("path");
import { AllowUserProfiles } from "../../../auth/decorators";
import { AppUserGuard } from "../../../auth/guards";
import { domifaConfig } from "../../../config";
import { structureDocRepository } from "../../../database";
import { ExpressResponse } from "../../../util/express";

@UseGuards(AuthGuard("jwt"), AppUserGuard)
@Controller("admin/structures-docs")
@ApiTags("structures-docs")
@ApiBearerAuth()
export class AdminStructuresDocsController {
  @Get("all")
  @AllowUserProfiles("super-admin-domifa")
  public async getAllStructureDocs() {
    return await structureDocRepository.findMany({ custom: true });
  }

  @Get("structure/:structureId/:uuid")
  @AllowUserProfiles("super-admin-domifa")
  public async getStructureDoc(
    @Param("uuid") uuid: string,
    @Param("structureId") structureId: number,
    @Res() res: ExpressResponse
  ) {
    const doc = await structureDocRepository.findOne({
      structureId,
      uuid,
    });
    const output = path.join(
      domifaConfig().upload.basePath,
      `${structureId}`,
      "docs",
      doc.path
    );

    return res.status(HttpStatus.OK).sendFile(output as string);
  }
}
