import {
  Body,
  Controller,
  Delete,
  Get,
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
import { CurrentUser } from "../../auth/current-user.decorator";
import { FacteurGuard } from "../../auth/guards/facteur.guard";
import { domifaConfig } from "../../config";
import { AppAuthUser } from "../../_common/model";

// tslint:disable-next-line: no-var-requires
const Docxtemplater = require("docxtemplater");
// tslint:disable-next-line: no-var-requires
const InspectModule = require("docxtemplater/js/inspect-module");

import * as fs from "fs";
import * as path from "path";

import { AppUserCreatedBy } from "../../_common/model/app-user/AppUserCreatedBy.type";
import { deleteFile } from "../../util/FileManager";
import { StructureDocDto } from "../dto/structure-doc.dto";
import { StructureDocService } from "../services/structure-doc.service";
import { StructureDoc } from "../../_common/model/structure-doc";

@ApiTags("structure-doc")
@ApiBearerAuth()
@UseGuards(AuthGuard("jwt"), FacteurGuard)
@Controller("structure-doc")
export class StructureDocController {
  constructor(private structureDocService: StructureDocService) {}

  @Get(":id")
  public async getStructureDoc(
    @Param("id") structureDocId: number,
    @CurrentUser() user: AppAuthUser,
    @Res() res: Response
  ) {
    const doc = await this.structureDocService.findOne(
      user.structureId,
      structureDocId
    );
    const output =
      domifaConfig().upload.basePath + user.structureId + "/docs/" + doc.path;
    return res.status(HttpStatus.OK).sendFile(output as string);
  }

  @ApiOperation({ summary: "Upload de documents personnalisables" })
  @Post("")
  @UseInterceptors(
    FileInterceptor("file", {
      fileFilter: (
        req: any,
        file: Express.Multer.File,
        cb: (error: any | null, success: boolean) => void
      ) => {
        const validFileExtensions = [
          "image/jpg",
          "application/pdf",
          "image/jpeg",
          "image/png",
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          "application/vnd.oasis.opendocument.text",
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "application/vnd.ms-excel",
        ];

        const mimeTest = !validFileExtensions.includes(file.mimetype);

        const sizeTest = file.size >= 10000000;
        if (sizeTest || mimeTest) {
          cb(
            {
              fileSize: sizeTest,
              fileType: mimeTest,
            },
            null
          );
        }
        cb(null, true);
      },
      storage: diskStorage({
        destination: (
          req: any,
          file: Express.Multer.File,
          cb: (error: Error | null, success: string) => void
        ) => {
          const dir =
            domifaConfig().upload.basePath + req.user.structureId + "/docs";

          if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
          }
          cb(null, dir);
        },

        filename: (req: any, file: Express.Multer.File, cb: any) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join("");
          return cb(null, `${randomName}${path.extname(file.originalname)}`);
        },
      }),
    })
  )
  public async uploadStructureDoc(
    @UploadedFile() file: Express.Multer.File,
    @Body() structureDocDto: StructureDocDto,
    @CurrentUser() user: AppAuthUser,
    @Res() res: Response
  ) {
    const createdBy: AppUserCreatedBy = user;

    // Check tags
    const newDoc: StructureDoc = {
      createdAt: new Date(),
      createdBy,
      filetype: file.mimetype,
      path: file.filename,
      tags: {},
      label: structureDocDto.label,
      custom: false,
      structureId: user.structureId,
    };

    // TODO: Enregistrement des tags
    if (structureDocDto.custom) {
    }

    await this.structureDocService.create(newDoc);

    return res
      .status(HttpStatus.OK)
      .json(this.structureDocService.findAll(user.structureId));
  }

  @Get("")
  public async getStructureDocs(@CurrentUser() user: AppAuthUser) {
    return this.structureDocService.findAll(user.structureId);
  }

  @Delete(":id")
  public async deleteDocument(
    @Param("id") structureDocId: number,
    @CurrentUser() user: AppAuthUser
  ) {
    const doc = await this.structureDocService.findOne(
      user.structureId,
      structureDocId
    );

    const pathFile =
      domifaConfig().upload.basePath + user.structureId + "/docs/" + doc.path;

    await deleteFile(pathFile);

    return this.structureDocService.deleteOne(user.structureId, structureDocId);
  }
}
