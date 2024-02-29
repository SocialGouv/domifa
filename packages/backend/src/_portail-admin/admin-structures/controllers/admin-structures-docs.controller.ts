import {
  UseGuards,
  Controller,
  Get,
  Param,
  Res,
  ParseUUIDPipe,
  ParseIntPipe,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ApiTags, ApiBearerAuth } from "@nestjs/swagger";

import { AllowUserProfiles, CurrentUser } from "../../../auth/decorators";
import { AppUserGuard } from "../../../auth/guards";
import { structureDocRepository } from "../../../database";
import { ExpressResponse } from "../../../util/express";
import { UserStructureAuthenticated } from "../../../_common/model";
import { FileManagerService } from "../../../util/file-manager/file-manager.service";
import { join } from "path";
import { cleanPath } from "../../../util";

@UseGuards(AuthGuard("jwt"), AppUserGuard)
@Controller("admin/structures-docs")
@ApiTags("structures-docs")
@ApiBearerAuth()
export class AdminStructuresDocsController {
  constructor(private readonly fileManagerService: FileManagerService) {}

  @Get("all")
  @AllowUserProfiles("super-admin-domifa")
  public async getAllStructureDocs() {
    return structureDocRepository.findBy({ custom: true });
  }

  @Get("structure/:structureId/:uuid")
  @AllowUserProfiles("super-admin-domifa")
  public async getStructureDoc(
    @Param("uuid", new ParseUUIDPipe()) uuid: string,
    @Param("structureId", new ParseIntPipe()) _structureId: number,
    @CurrentUser() user: UserStructureAuthenticated,
    @Res() res: ExpressResponse
  ) {
    const doc = await structureDocRepository.findOneBy({
      uuid,
    });

    if (!doc) {
      return res.status(400);
    }

    const filePath = join(
      "structure-documents",
      cleanPath(`${user.structureId}`),
      doc.path
    );

    return await this.fileManagerService.downloadObject(filePath, res);
  }
}
