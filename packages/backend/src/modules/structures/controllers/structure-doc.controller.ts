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

import { CurrentUser } from "../../../auth/decorators/current-user.decorator";
import { AppUserGuard } from "../../../auth/guards";
import {
  AllowUserProfiles,
  AllowUserStructureRoles,
} from "../../../auth/decorators";
import {
  cleanPath,
  randomName,
  validateUpload,
} from "../../../util/file-manager/FileManager";
import { UserStructureAuthenticated } from "../../../_common/model";
import { StructureDocDto } from "../dto/structure-doc.dto";

import { structureDocRepository, StructureDocTable } from "../../../database";
import { FILES_SIZE_LIMIT } from "../../../util/file-manager";
import { join } from "path";
import { FileManagerService } from "../../../util/file-manager/file-manager.service";
import { validateDocTemplate } from "../../../usagers/utils/custom-docs";
import { StructureDocTypesAvailable } from "@domifa/common";
import { appLogger } from "../../../util";

@ApiTags("structure-docs")
@ApiBearerAuth()
@UseGuards(AuthGuard("jwt"), AppUserGuard)
@Controller("structure-docs")
@AllowUserProfiles("structure")
@AllowUserStructureRoles("simple", "responsable", "admin")
export class StructureDocController {
  constructor(private readonly fileManagerService: FileManagerService) {}

  @Get(":uuid")
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

      const filePath = join(
        "structure-documents-encrypted",
        cleanPath(`${doc.structureId}`),
        `${doc.path}.sfe`
      );

      return await this.fileManagerService.dowloadEncryptedFile(
        res,
        filePath,
        doc
      );
    } catch (e) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json({ message: "DOC_NOT_FOUND" });
    }
  }

  @ApiOperation({ summary: "Upload de documents personnalisables" })
  @Post("")
  @UseInterceptors(
    FileInterceptor("file", {
      limits: FILES_SIZE_LIMIT,
      fileFilter: (
        req,
        file: Express.Multer.File,
        callback: (error: Error | null, acceptFile: boolean) => void
      ) => {
        if (!validateUpload("STRUCTURE_DOC", req, file)) {
          callback(new Error("INCORRECT_FORMAT"), false);
        }
        callback(null, true);
      },
    })
  )
  public async uploadStructureDoc(
    @UploadedFile() file: Express.Multer.File,
    @Body() structureDocDto: StructureDocDto,
    @CurrentUser() user: UserStructureAuthenticated,
    @Res() res: Response
  ) {
    if (structureDocDto.custom === true) {
      const templateValidation = await validateDocTemplate(file.buffer);

      if (!templateValidation.isValid) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          message: templateValidation.error,
        });
      }
    }

    // Si attestation de refus, ou postale, on supprime l'ancienne version
    if (
      structureDocDto.customDocType ===
        StructureDocTypesAvailable.attestation_postale ||
      structureDocDto.customDocType ===
        StructureDocTypesAvailable.cerfa_attestation ||
      structureDocDto.customDocType ===
        StructureDocTypesAvailable.courrier_radiation
    ) {
      const doc = await structureDocRepository.findOneBy({
        structureId: user.structureId,
        customDocType: structureDocDto.customDocType,
      });

      if (doc) {
        await this.deleteDocument(doc.uuid, user, res);
      }
    }

    const path = randomName(file);
    const encryptionContext = crypto.randomUUID();

    const newDoc = new StructureDocTable({
      createdAt: new Date(),
      createdBy: {
        id: user.id,
        nom: user.nom,
        prenom: user.prenom,
      },
      encryptionContext,
      displayInPortailUsager: false,
      filetype: file.mimetype,
      path,
      label: structureDocDto.label,
      custom: structureDocDto.custom,
      structureId: user.structureId,
      customDocType: structureDocDto.customDocType,
    });

    const filePath = join(
      "structure-documents-encrypted",
      cleanPath(`${user.structureId}`),
      `${path}.sfe`
    );

    try {
      await this.fileManagerService.saveEncryptedFile(filePath, newDoc, file);
    } catch (e) {
      console.log(e);
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ message: "CANNOT_ENCRYPT_FILE" });
    }

    try {
      await structureDocRepository.insert(newDoc);
      const docs = await structureDocRepository.findBy({
        structureId: user.structureId,
      });

      return res.status(HttpStatus.OK).json(docs);
    } catch (err) {
      appLogger.error(err);
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json({ message: "UPLOAD_FAIL" });
    }
  }

  @Get("")
  public async getStructureDocs(
    @CurrentUser() user: UserStructureAuthenticated
  ) {
    return await structureDocRepository.find({
      where: { structureId: user.structureId },
      order: { createdAt: "DESC" },
    });
  }

  @Delete(":uuid")
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

      await this.fileManagerService.deleteFile(doc.path);

      await structureDocRepository.delete({
        structureId: user.structureId,
        uuid: doc.uuid,
      });

      const docs = structureDocRepository.findBy({
        structureId: user.structureId,
      });
      return res.status(HttpStatus.OK).json(docs);
    } catch (err) {
      appLogger.error(err);
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json({ message: "DOC_NOT_FOUND" });
    }
  }
}
