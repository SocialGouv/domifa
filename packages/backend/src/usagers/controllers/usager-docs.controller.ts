import { Usager } from "./../../_common/model/usager/Usager.type";
import { UsagerDocsTable } from "./../../database/entities/usager/UsagerDocsTable.typeorm";
import { usagerDocsRepository } from "./../../database/services/usager/usagerDocsRepository.service";
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  ParseIntPipe,
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

import { AllowUserStructureRoles } from "../../auth/decorators";
import { CurrentUsager } from "../../auth/decorators/current-usager.decorator";
import { CurrentUser } from "../../auth/decorators/current-user.decorator";
import { AppUserGuard } from "../../auth/guards";
import { UsagerAccessGuard } from "../../auth/guards/usager-access.guard";
import { domifaConfig } from "../../config";

import {
  cleanPath,
  compressAndResizeImage,
  deleteFile,
  getUsagerFilePath,
  validateUpload,
} from "../../util/file-manager/FileManager";
import { UsagerDoc, UserStructureAuthenticated } from "../../_common/model";

import { AppLogsService } from "../../modules/app-logs/app-logs.service";
import { UploadUsagerDocDto } from "../dto";
import { createReadStream } from "fs-extra";

import crypto from "node:crypto";
import { ExpressRequest } from "../../util/express";
import {
  decryptFile,
  encryptFile,
} from "@socialgouv/streaming-file-encryption";
import { pipeline } from "node:stream/promises";
import { FILES_SIZE_LIMIT } from "../../util/file-manager";
import { PassThrough, Readable } from "node:stream";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { join } from "node:path";

@UseGuards(AuthGuard("jwt"), AppUserGuard, UsagerAccessGuard)
@ApiTags("docs")
@ApiBearerAuth()
@Controller("docs")
export class UsagerDocsController {
  constructor(private readonly appLogsService: AppLogsService) {}

  @ApiOperation({
    summary: "Téléverser des pièces-jointes dans le dossier d'un usager",
  })
  @Post(":usagerRef")
  @AllowUserStructureRoles("simple", "responsable", "admin")
  @UseInterceptors(
    FileInterceptor("file", {
      limits: FILES_SIZE_LIMIT,
      fileFilter: (
        req: ExpressRequest,
        file: Express.Multer.File,
        callback: (error: Error | null, acceptFile: boolean) => void
      ) => {
        if (!validateUpload("USAGER_DOC", req, file)) {
          callback(new Error("INCORRECT_FORMAT"), false);
        }
        callback(null, true);
      },
    })
  )
  public async uploadDoc(
    @Param("usagerRef", new ParseIntPipe()) usagerRef: number,
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: UserStructureAuthenticated,
    @CurrentUsager() currentUsager: Usager,
    @Body() postData: UploadUsagerDocDto,
    @Res() res: Response
  ) {
    const encryptionContext = crypto.randomUUID();
    const userName = user.prenom + " " + user.nom;

    const newDoc: UsagerDocsTable = {
      createdAt: new Date(),
      createdBy: userName,
      filetype: file.mimetype,
      label: postData.label,
      path: file.filename,
      usagerRef,
      structureId: currentUsager.structureId,
      usagerUUID: currentUsager.uuid,
      encryptionContext,
      encryptionVersion: 0,
    };

    try {
      await this.saveEncryptedFile(user, newDoc, file);
    } catch (e) {
      console.log(e);
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ message: "CANNOT_ENCRYPT_FILE" });
    }

    await usagerDocsRepository.save(newDoc);

    const docs = await usagerDocsRepository.getUsagerDocs(
      usagerRef,
      currentUsager.structureId
    );

    return res.status(HttpStatus.OK).json(docs);
  }

  @Delete(":usagerRef/:docUuid")
  @AllowUserStructureRoles("simple", "responsable", "admin")
  public async deleteDocument(
    @Param("usagerRef", new ParseIntPipe()) usagerRef: number,
    @Param("docUuid", new ParseUUIDPipe()) docUuid: string,
    @CurrentUser() user: UserStructureAuthenticated,
    @CurrentUsager() currentUsager: Usager,
    @Res() res: Response
  ) {
    const doc = await usagerDocsRepository.findOneBy({
      uuid: docUuid,
      structureId: currentUsager.structureId,
    });

    if (!doc) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json({ message: "DOC_NOT_FOUND" });
    }

    const filePath = await getUsagerFilePath(
      user.structure.uuid,
      currentUsager.uuid,
      doc.path + ".sfe"
    );

    await deleteFile(filePath);

    await usagerDocsRepository.delete({
      uuid: doc.uuid,
    });

    await this.appLogsService.create({
      userId: user.id,
      usagerRef,
      structureId: user.structureId,
      action: "SUPPRIMER_PIECE_JOINTE",
    });

    const docs = await usagerDocsRepository.getUsagerDocs(
      usagerRef,
      currentUsager.structureId
    );

    return res.status(HttpStatus.OK).json(docs);
  }

  @Get(":usagerRef")
  @AllowUserStructureRoles("simple", "responsable", "admin")
  public async getUsagerDocuments(
    @Param("usagerRef", new ParseIntPipe()) usagerRef: number,
    @CurrentUsager() currentUsager: Usager
  ): Promise<UsagerDoc[]> {
    return usagerDocsRepository.getUsagerDocs(
      usagerRef,
      currentUsager.structureId
    );
  }

  @Get(":usagerRef/:docUuid")
  @AllowUserStructureRoles("simple", "responsable", "admin")
  public async getDocument(
    @Param("docUuid", new ParseUUIDPipe()) docUuid: string,
    @Param("usagerRef", new ParseIntPipe()) usagerRef: number,
    @Res() res: Response,
    @CurrentUser() user: UserStructureAuthenticated,
    @CurrentUsager() currentUsager: Usager
  ) {
    const doc = await usagerDocsRepository.findOneBy({
      uuid: docUuid,
      usagerRef,
      structureId: currentUsager.structureId,
    });

    if (!doc?.encryptionContext || doc?.encryptionVersion !== 0) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json({ message: "DOC_NOT_FOUND" });
    }

    const mainSecret = domifaConfig().security.mainSecret;

    const encryptedFilePath = await getUsagerFilePath(
      user.structure.uuid,
      doc.usagerUUID,
      doc.path + ".sfe"
    );

    try {
      return pipeline(
        // note: encryptedFilePath should end with .sfe, not .encrypted, to prepare for phase 3.
        createReadStream(encryptedFilePath),
        decryptFile(mainSecret, doc.encryptionContext),
        res
      );
    } catch (e) {
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ message: "CANNOT_UPLOAD_FILE" });
    }
  }

  // encrypt a cleartext file to sfe and delete original
  private async saveEncryptedFile(
    user: UserStructureAuthenticated,
    usagerDoc: UsagerDoc,
    file: Express.Multer.File
  ): Promise<any> {
    const s3 = new S3Client({
      endpoint: "http://localhost:9000",
      credentials: {
        accessKeyId: domifaConfig().upload.bucketAccessKey,
        secretAccessKey: domifaConfig().upload.bucketSecretKey,
      },
      region: domifaConfig().upload.bucketRegion,
      forcePathStyle: true,
    });

    const destination = join(
      "usager-documents",
      cleanPath(user.structure.uuid),
      cleanPath(usagerDoc.usagerUUID)
    );

    const passThrough = new PassThrough();

    const mainSecret = domifaConfig().security.mainSecret;

    if (
      usagerDoc.filetype === "image/jpeg" ||
      usagerDoc.filetype === "image/png"
    ) {
      await pipeline(
        Readable.from(file.buffer),
        compressAndResizeImage(usagerDoc),
        encryptFile(mainSecret, usagerDoc.encryptionContext),
        passThrough
      );
      console.log("END OF PIPELINE 1 ");
    } else {
      await pipeline(
        Readable.from(file.buffer),
        encryptFile(mainSecret, usagerDoc.encryptionContext),
        passThrough
      );
      console.log("END OF PIPELINE 2 ");
    }

    const params = {
      Bucket: domifaConfig().upload.bucketName,
      Key: `${destination}.sfe`, // Nom du fichier dans le bucket S3
      Body: passThrough,
    };

    const command = new PutObjectCommand(params);

    try {
      const response = await s3.send(command);
      console.log("Upload réussi", response);
      return response;
    } catch (error) {
      console.error("Erreur lors de l'upload", error);
      return new Error("Erreur lors de l'upload");
    }
  }
}
