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
import { ExpressResponse } from "../../../util/express";

import { StructureDocService } from "./../../../structures/services/structure-doc.service";

@UseGuards(AuthGuard("jwt"), AppUserGuard)
@Controller("admin/structures-docs")
@ApiTags("structures-docs")
@ApiBearerAuth()
export class AdminStructuresController {
  constructor(private readonly structureDocService: StructureDocService) {}

  @Get("")
  @AllowUserProfiles("super-admin-domifa")
  public async getAllStructureDocs() {
    return await this.structureDocService.findAllStructureDocs();
  }

  @Get(":structureId/:uuid")
  @AllowUserProfiles("super-admin-domifa")
  public async getStructureDoc(
    @Param("uuid") uuid: string,
    @Param("structureId") structureId: number,
    @Res() res: ExpressResponse
  ) {
    const doc = await this.structureDocService.findOne(structureId, uuid);
    const output = path.join(
      domifaConfig().upload.basePath,
      `${structureId}`,
      "docs",
      doc.path
    );

    return res.status(HttpStatus.OK).sendFile(output as string);
  }
}
