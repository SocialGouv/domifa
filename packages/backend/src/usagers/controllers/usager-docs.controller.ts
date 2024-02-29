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
  randomName,
  validateUpload,
} from "../../util/file-manager/FileManager";
import { UsagerDoc, UserStructureAuthenticated } from "../../_common/model";

import { AppLogsService } from "../../modules/app-logs/app-logs.service";
import { UploadUsagerDocDto } from "../dto";

import crypto from "node:crypto";
import { ExpressRequest } from "../../util/express";
import {
  decryptFile,
  encryptFile,
} from "@socialgouv/streaming-file-encryption";
import { pipeline } from "node:stream/promises";
import { FILES_SIZE_LIMIT } from "../../util/file-manager";
import { PassThrough, Readable } from "node:stream";
import {
  S3Client,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { join } from "node:path";
import { Upload } from "@aws-sdk/lib-storage";

const s3 = new S3Client({
  endpoint: "http://localhost:9000",
  credentials: {
    accessKeyId: domifaConfig().upload.bucketAccessKey,
    secretAccessKey: domifaConfig().upload.bucketSecretKey,
  },
  region: domifaConfig().upload.bucketRegion,
  forcePathStyle: true,
});

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

    const filePath = join(
      "usager-documents",
      cleanPath(user.structure.uuid),
      cleanPath(currentUsager.uuid),
      `${randomName(file)}.sfe`
    );

    const newDoc: UsagerDocsTable = {
      createdAt: new Date(),
      createdBy: userName,
      filetype: file.mimetype,
      label: postData.label,
      path: filePath,
      usagerRef,
      structureId: currentUsager.structureId,
      usagerUUID: currentUsager.uuid,
      encryptionContext,
      encryptionVersion: 0,
    };

    try {
      await this.saveEncryptedFile(filePath, newDoc, file);
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

    await s3.send(
      new DeleteObjectCommand({
        Bucket: domifaConfig().upload.bucketName,
        Key: `${domifaConfig().upload.bucketRootDir}/${doc.path}`,
      })
    );

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
    @CurrentUser() _user: UserStructureAuthenticated,
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
    const body = await this.downloadFile(doc.path);

    try {
      return pipeline(
        // note: encryptedFilePath should end with .sfe, not .encrypted, to prepare for phase 3.
        body,
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
    filePath: string,
    usagerDoc: UsagerDoc,
    file: Express.Multer.File
  ): Promise<void> {
    const passThrough = new PassThrough();

    const mainSecret = domifaConfig().security.mainSecret;

    if (
      usagerDoc.filetype === "image/jpeg" ||
      usagerDoc.filetype === "image/png"
    ) {
      pipeline(
        Readable.from(file.buffer),
        compressAndResizeImage(usagerDoc),
        encryptFile(mainSecret, usagerDoc.encryptionContext),
        passThrough
      );
    } else {
      pipeline(
        Readable.from(file.buffer),
        encryptFile(mainSecret, usagerDoc.encryptionContext),
        passThrough
      );
    }

    const params = {
      Bucket: domifaConfig().upload.bucketName,
      Key: `${domifaConfig().upload.bucketRootDir}/${filePath}`,
      Body: passThrough,
    };

    const parallelUploads3 = new Upload({
      client: s3,
      params,
    });

    try {
      const uploadResult = await parallelUploads3.done();
      console.log("done uploading", uploadResult);
    } catch (e) {
      console.error(e);
      throw new Error(e);
    }
  }

  private async downloadFile(path: string): Promise<Readable> {
    const { Body } = await s3.send(
      new GetObjectCommand({
        Bucket: domifaConfig().upload.bucketName,
        Key: `${domifaConfig().upload.bucketRootDir}/${path}`,
      })
    );

    if (Body instanceof Readable) {
      return Body;
    } else {
      throw new Error("Type de Body non pris en charge");
    }
  }
}
