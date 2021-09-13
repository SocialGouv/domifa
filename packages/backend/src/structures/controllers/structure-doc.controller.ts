import {
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
import * as fs from "fs";
import { diskStorage } from "multer";
import * as path from "path";
import { CurrentUser } from "../../auth/current-user.decorator";
import { FacteurGuard } from "../../auth/guards/facteur.guard";
import { domifaConfig } from "../../config";
import { deleteFile, randomName, validateUpload } from "../../util/FileManager";
import { UserStructureAuthenticated } from "../../_common/model";
import { StructureDoc } from "../../_common/model/structure-doc";
import { StructureDocDto } from "../dto/structure-doc.dto";
import { StructureDocService } from "../services/structure-doc.service";

@ApiTags("structure-docs")
@ApiBearerAuth()
@UseGuards(AuthGuard("jwt"), FacteurGuard)
@Controller("structure-docs")
export class StructureDocController {
  constructor(private structureDocService: StructureDocService) {}

  @Get(":id")
  public async getStructureDoc(
    @Param("id") structureDocId: number,
    @CurrentUser() user: UserStructureAuthenticated,
    @Res() res: Response
  ) {
    const doc = await this.structureDocService.findOne(
      user.structureId,
      structureDocId
    );
    const output = path.join(
      domifaConfig().upload.basePath,
      `${user.structureId}`,
      "docs",
      doc.path
    );

    return res.status(HttpStatus.OK).sendFile(output as string);
  }

  @ApiOperation({ summary: "Upload de documents personnalisables" })
  @Post("")
  @UseInterceptors(
    FileInterceptor("file", {
      limits: {
        fieldSize: 10 * 1024 * 1024,
        files: 1,
      },
      fileFilter: (
        req: any,
        file: Express.Multer.File,
        cb: (error: any | null, success: boolean) => void
      ) => {
        if (!validateUpload("STRUCTURE_DOC", req, file)) {
          throw new HttpException("INCORRECT_FORMAT", HttpStatus.BAD_REQUEST);
        }

        cb(null, true);
      },
      storage: diskStorage({
        destination: (
          req: any,
          file: Express.Multer.File,
          cb: (error: Error | null, success: string) => void
        ) => {
          const dir = path.join(
            domifaConfig().upload.basePath,
            `${req.user.structureId}`,
            "docs"
          );

          if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
          }
          cb(null, dir);
        },

        filename: (req: any, file: Express.Multer.File, cb: any) => {
          return cb(null, randomName(file));
        },
      }),
    })
  )
  public async uploadStructureDoc(
    @UploadedFile() file: Express.Multer.File,
    @Body() structureDocDto: StructureDocDto,
    @CurrentUser() user: UserStructureAuthenticated,
    @Res() res: Response
  ) {
    // Check tags
    const newDoc: StructureDoc = {
      createdAt: new Date(),
      createdBy: {
        id: user.id,
        nom: user.nom,
        prenom: user.prenom,
      },
      filetype: file.mimetype,
      path: file.filename,
      tags: {},
      label: structureDocDto.label,
      custom: false,
      structureId: user.structureId,
    };

    if (structureDocDto.custom) {
      // TODO: Enregistrement des tags
      //
    }

    await this.structureDocService.create(newDoc);

    return res
      .status(HttpStatus.OK)
      .json(this.structureDocService.findAll(user.structureId));
  }

  @Get("")
  public async getStructureDocs(
    @CurrentUser() user: UserStructureAuthenticated
  ) {
    return this.structureDocService.findAll(user.structureId);
  }

  @Delete(":id")
  public async deleteDocument(
    @Param("id") structureDocId: number,
    @CurrentUser() user: UserStructureAuthenticated
  ) {
    const doc = await this.structureDocService.findOne(
      user.structureId,
      structureDocId
    );

    const pathFile = path.join(
      domifaConfig().upload.basePath,
      `${user.structureId}`,
      "docs",
      doc.path
    );

    await deleteFile(pathFile);

    return this.structureDocService.deleteOne(user.structureId, structureDocId);
  }
}
