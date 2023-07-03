import {
  UseGuards,
  Controller,
  Get,
  Param,
  Res,
  HttpStatus,
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
import { buildCustomDocPath } from "../../../usagers/services/custom-docs";

@UseGuards(AuthGuard("jwt"), AppUserGuard)
@Controller("admin/structures-docs")
@ApiTags("structures-docs")
@ApiBearerAuth()
export class AdminStructuresDocsController {
  @Get("all")
  @AllowUserProfiles("super-admin-domifa")
  public async getAllStructureDocs() {
    return await structureDocRepository.findBy({ custom: true });
  }

  @Get("structure/:structureId/:uuid")
  @AllowUserProfiles("super-admin-domifa")
  public async getStructureDoc(
    @Param("uuid", new ParseUUIDPipe()) uuid: string,
    @Param("structureId", new ParseIntPipe()) structureId: number,
    @CurrentUser() user: UserStructureAuthenticated,
    @Res() res: ExpressResponse
  ) {
    const doc = await structureDocRepository.findOneBy({
      structureId: user.structureId,
      uuid,
    });

    const output = buildCustomDocPath({
      structureId,
      docPath: doc.path,
    });

    return res.status(HttpStatus.OK).sendFile(output as string);
  }
}
