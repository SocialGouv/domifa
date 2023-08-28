import {
  Body,
  Controller,
  Delete,
  Get,
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
import {
  deleteFile,
  randomName,
  validateUpload,
} from "../../util/file-manager/FileManager";
import { UserStructureAuthenticated } from "../../_common/model";
import { StructureDoc } from "../../_common/model/structure-doc";
import { StructureDocDto } from "../dto/structure-doc.dto";

import { structureDocRepository } from "../../database";
import { ExpressRequest } from "../../util/express";
import { FILES_SIZE_LIMIT } from "../../util/file-manager";
import {
  buildCustomDocPath,
  getCustomDocsDir,
} from "../../usagers/services/custom-docs";

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

      const output = buildCustomDocPath({
        structureId: user.structureId,
        docPath: doc.path,
      });

      return res.status(HttpStatus.OK).sendFile(output);
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
      limits: FILES_SIZE_LIMIT,
      fileFilter: (
        req: ExpressRequest,
        file: Express.Multer.File,
        callback: (error: Error | null, acceptFile: boolean) => void
      ) => {
        if (!validateUpload("STRUCTURE_DOC", req, file)) {
          callback(new Error("INCORRECT_FORMAT"), false);
        }
        callback(null, true);
      },
      storage: diskStorage({
        destination: (
          req: ExpressRequest,
          _file: Express.Multer.File,
          callback: (error: Error | null, destination: string) => void
        ) => {
          (async () => {
            const user = req.user as UserStructureAuthenticated;
            const dir = await getCustomDocsDir(user.structureId);
            callback(null, dir);
          })();
        },

        filename: (
          _req: ExpressRequest,
          file: Express.Multer.File,
          callback: (error: Error | null, destination: string) => void
        ) => {
          return callback(null, randomName(file));
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

      const pathFile = buildCustomDocPath({
        structureId: user.structureId,
        docPath: doc.path,
      });
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
