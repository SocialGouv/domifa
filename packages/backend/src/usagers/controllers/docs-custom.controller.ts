import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { FileInterceptor } from "@nestjs/platform-express";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Response } from "express";
import { diskStorage } from "multer";

import * as crypto from "crypto";
import * as fs from "fs";
import * as path from "path";

import { CurrentUsager } from "../../auth/current-usager.decorator";
import { CurrentUser } from "../../auth/current-user.decorator";
import { FacteurGuard } from "../../auth/guards/facteur.guard";
import { UsagerAccessGuard } from "../../auth/guards/usager-access.guard";
import { domifaConfig } from "../../config";
import { AppAuthUser } from "../../_common/model";
import { Usager } from "../interfaces/usagers";
import { DocumentsService } from "../services/documents.service";
import { UsagersService } from "../services/usagers.service";

import Sentry = require("@sentry/node");

@UseGuards(AuthGuard("jwt"), FacteurGuard)
@ApiTags("docs-custom")
@ApiBearerAuth()
@Controller("docs")
export class DocsCustomController {
  constructor(
    private readonly usagersService: UsagersService,
    private readonly docsService: DocumentsService
  ) {}

  /*
  @ApiOperation({ summary: "Upload de pièces-jointes" })
  @Post(":structure-id")
  @UseInterceptors(
    FileInterceptor("file", {
      fileFilter: (req: any, file: any, cb: any) => {
        const mimeTest = !file.mimetype.match(/\/(doc|docx)$/);
        const sizeTest = file.size >= 10000000;
        if (sizeTest || mimeTest) {
          throw new BadRequestException({
            fileSize: sizeTest,
            fileType: mimeTest,
          });
        }
        cb(null, true);
      },
      storage: diskStorage({
        destination: (req: any, file: any, cb: any) => {
          const dir =
            domifaConfig().upload.basePath + req.user.structureId + "/docs";

          if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
          }
          cb(null, dir);
        },

        filename: (req: any, file: any, cb: any) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join("");
          return cb(null, `${randomName}${path.extname(file.originalname)}`);
        },
      }),
    })
  )
  public async uploadDoc(
    @Param("id") usagerId: number,
    @UploadedFile() file: any,
    @Body() postData: any,
    @CurrentUser() user: AppAuthUser,
    @CurrentUsager() usager: Usager,
    @Res() res: Response
  ) {
    const userName = user.prenom + " " + user.nom;
    const newDoc = {
      createdAt: new Date(),
      createdBy: userName,
      filetype: file.mimetype,
      label: postData.label,
    };

    // TODO: récupérer les paramètres du doc et les mettre dans la donnée

    const fileName =
      domifaConfig().upload.basePath +
      user.structureId +
      "/" +
      usagerId +
      "/" +
      file.filename;

  }

  @Delete(":id/:index")
  public async deleteDocument(
    @Param("id") usagerId: number,
    @Param("index") index: number,
    @CurrentUser() user: AppAuthUser,
    @CurrentUsager() usager: Usager,
    @Res() res: Response
  ) {
    const fileInfos = usager.docs[index];
    fileInfos.path = usager.docsPath[index];
  }

  */

  @Get(":id/:index")
  @UseGuards(AuthGuard("jwt"), UsagerAccessGuard, FacteurGuard)
  public async getDocument(
    @Param("id") usagerId: number,
    @Param("index") index: number,
    @Res() res: Response,
    @CurrentUsager() usager: Usager
  ) {
    if (
      typeof usager.docs[index] === "undefined" ||
      typeof usager.docsPath[index] === "undefined"
    ) {
      throw new HttpException(
        {
          message: "DOC_NOT_FOUND_GET",
          usagerId,
          structureId: usager.structureId,
        },
        HttpStatus.BAD_REQUEST
      );
    }

    const fileInfos = usager.docs[index];
    fileInfos.path = usager.docsPath[index];

    const pathFile = path.resolve(
      domifaConfig().upload.basePath +
        usager.structureId +
        "/" +
        usager.id +
        "/" +
        fileInfos.path
    );
    res.sendFile(pathFile);
  }
}
