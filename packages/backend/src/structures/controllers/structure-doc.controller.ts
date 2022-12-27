import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  ParseUUIDPipe,
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

import { CurrentUser } from "../../auth/decorators/current-user.decorator";
import { AppUserGuard } from "../../auth/guards";
import { AllowUserStructureRoles } from "../../auth/decorators";
import { domifaConfig } from "../../config";
import { deleteFile, randomName, validateUpload } from "../../util/FileManager";
import { UserStructureAuthenticated } from "../../_common/model";
import { StructureDoc } from "../../_common/model/structure-doc";
import { StructureDocDto } from "../dto/structure-doc.dto";

import { structureDocRepository } from "../../database";
import { ExpressRequest } from "../../util/express";
import { join } from "path";
import { ensureDir, pathExists } from "fs-extra";

@ApiTags("structure-docs")
@ApiBearerAuth()
@UseGuards(AuthGuard("jwt"), AppUserGuard)
@Controller("structure-docs")
export class StructureDocController {
  @Get(":uuid")
  @AllowUserStructureRoles("simple", "responsable", "admin")
  public async getStructureDoc(
    @Param("uuid", new ParseUUIDPipe()) uuid: string,
    @CurrentUser() user: UserStructureAuthenticated,
    @Res() res: Response
  ) {
    try {
      const doc = await structureDocRepository.findOneByOrFail({
        structureId: user.structureId,
        uuid,
      });

      const output = join(
        domifaConfig().upload.basePath,
        `${user.structureId}`,
        "docs",
        doc.path
      );

      return res.status(HttpStatus.OK).sendFile(output as string);
    } catch (e) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json({ message: "DOC_NOT_FOUND" });
    }
  }

  @ApiOperation({ summary: "Upload de documents personnalisables" })
  @Post("")
  @AllowUserStructureRoles("simple", "responsable", "admin")
  @UseInterceptors(
    FileInterceptor("file", {
      limits: {
        fieldSize: 10 * 1024 * 1024,
        files: 1,
      },
      fileFilter: (
        req: ExpressRequest,
        file: Express.Multer.File,
        cb: (error: any | null, success: boolean) => void
      ) => {
        if (!validateUpload("STRUCTURE_DOC", req, file)) {
          throw new HttpException("INCORRECT_FORMAT", HttpStatus.BAD_REQUEST);
        }

        cb(null, true);
      },
      storage: diskStorage({
        destination: async (
          req: any,
          _file: Express.Multer.File,
          cb: (error: Error | null, success: string) => void
        ) => {
          const dir = join(
            domifaConfig().upload.basePath,
            `${req.user.structureId}`,
            "docs"
          );

          if (!(await pathExists(dir))) {
            await ensureDir(dir);
          }
          cb(null, dir);
        },

        filename: (
          _req: ExpressRequest,
          file: Express.Multer.File,
          cb: any
        ) => {
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
    // Si attestation de refus, ou postale, on supprime l'ancienne version
    if (
      structureDocDto.customDocType === "attestation_postale" ||
      structureDocDto.customDocType === "courrier_radiation"
    ) {
      const doc = await structureDocRepository.findOneBy({
        structureId: user.structureId,
        customDocType: structureDocDto.customDocType,
      });

      if (doc) {
        await this.deleteDocument(doc.uuid, user, res);
      }
    }

    const newDoc: StructureDoc = {
      createdAt: new Date(),
      createdBy: {
        id: user.id,
        nom: user.nom,
        prenom: user.prenom,
      },
      displayInPortailUsager: false,
      filetype: file.mimetype,
      path: file.filename,
      tags: null,
      label: structureDocDto.label,
      custom: structureDocDto.custom,
      structureId: user.structureId,
      customDocType: structureDocDto.customDocType,
    };

    // Ajout du document
    try {
      await structureDocRepository.insert(newDoc);

      const docs = await structureDocRepository.findBy({
        structureId: user.structureId,
      });

      return res.status(HttpStatus.OK).json(docs);
    } catch (e) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json({ message: "UPLOAD_FAIL" });
    }
  }

  @Get("")
  @AllowUserStructureRoles("simple", "responsable", "admin")
  public async getStructureDocs(
    @CurrentUser() user: UserStructureAuthenticated
  ) {
    return structureDocRepository.findBy({ structureId: user.structureId });
  }

  @Delete(":uuid")
  @AllowUserStructureRoles("simple", "responsable", "admin")
  public async deleteDocument(
    @Param("uuid", new ParseUUIDPipe()) uuid: string,
    @CurrentUser() user: UserStructureAuthenticated,
    @Res() res: Response
  ) {
    try {
      const doc = await structureDocRepository.findOneByOrFail({
        structureId: user.structureId,
        uuid,
      });

      const pathFile = join(
        domifaConfig().upload.basePath,
        `${user.structureId}`,
        "docs",
        doc.path
      );

      await deleteFile(pathFile);

      await structureDocRepository.delete({
        structureId: user.structureId,
        uuid: doc.uuid,
      });

      const docs = structureDocRepository.findBy({
        structureId: user.structureId,
      });
      return res.status(HttpStatus.OK).json(docs);
    } catch (e) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json({ message: "DOC_NOT_FOUND" });
    }
  }
}
