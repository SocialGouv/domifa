import {
  Controller,
  Get,
  HttpStatus,
  Param,
  Res,
  UseGuards,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { Response } from "express";
import { CurrentUsager } from "../../auth/current-usager.decorator";
import { CurrentUser } from "../../auth/current-user.decorator";
import { FacteurGuard } from "../../auth/guards/facteur.guard";
import { UsagerAccessGuard } from "../../auth/guards/usager-access.guard";
import { AppUser, UsagerLight } from "../../_common/model";
import {
  buildCustomDoc,
  customDocTemplateLoader,
  generateCustomDoc,
} from "../custom-docs";

@UseGuards(AuthGuard("jwt"), FacteurGuard)
@ApiTags("usagers-structure-docs")
@ApiBearerAuth()
@Controller("usagers-structure-docs")
export class UsagerStructureDocsController {
  constructor() {}

  @Get(":usagerRef/:docType")
  @UseGuards(AuthGuard("jwt"), UsagerAccessGuard, FacteurGuard)
  public async getDocument(
    @Param("docType") docType: string,
    @CurrentUsager() usager: UsagerLight,
    @CurrentUser() user: AppUser,
    @Res() res: Response
  ) {
    if (docType !== "attestation_postale" && docType !== "courrier_radiation") {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json({ message: "INVALID_PARAM_DOCS" });
    }

    const content = customDocTemplateLoader.loadCustomDocTemplate({
      docType,
      structureId: user.structureId,
    });

    const docValues = buildCustomDoc(usager, user.structure);

    res.end(generateCustomDoc(content, docValues));
  }
}
