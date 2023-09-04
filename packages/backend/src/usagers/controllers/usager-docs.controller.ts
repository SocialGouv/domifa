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
import { diskStorage } from "multer";

import { AllowUserStructureRoles } from "../../auth/decorators";
import { CurrentUsager } from "../../auth/decorators/current-usager.decorator";
import { CurrentUser } from "../../auth/decorators/current-user.decorator";
import { AppUserGuard } from "../../auth/guards";
import { UsagerAccessGuard } from "../../auth/guards/usager-access.guard";
import { domifaConfig } from "../../config";

import { appLogger } from "../../util";
import {
  compressAndResizeImage,
  deleteFile,
  getFileDir,
  getFilePath,
  getNewFileDir,
  randomName,
  validateUpload,
} from "../../util/file-manager/FileManager";
import { UsagerDoc, UserStructureAuthenticated } from "../../_common/model";

import { AppLogsService } from "../../modules/app-logs/app-logs.service";
import { UploadUsagerDocDto } from "../dto";
import {
  createReadStream,
  createWriteStream,
  pathExists,
  stat,
} from "fs-extra";
import { join } from "path";

import crypto, { createDecipheriv } from "node:crypto";
import { ExpressRequest } from "../../util/express";
import {
  decryptFile,
  encryptFile,
} from "@socialgouv/streaming-file-encryption";
import { pipeline } from "node:stream/promises";
import { FILES_SIZE_LIMIT } from "../../util/file-manager";

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
      storage: diskStorage({
        destination: (req: any, _file: Express.Multer.File, cb: any) => {
          (async () => {
            const dir = await getNewFileDir(
              req.user.structure.uuid,
              req.usager.uuid
            );
            cb(null, dir);
          })();
        },
        filename: (
          _req: ExpressRequest,
          file: Express.Multer.File,
          callback: (error: Error | null, destination: string) => void
        ) => {
          callback(null, randomName(file));
        },
      }),
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
      await this.saveEncryptedFile(user, newDoc);
    } catch (e) {
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

    let filePath = "";

    if (doc.encryptionContext) {
      filePath = await getFilePath(
        user.structure.uuid,
        currentUsager.uuid,
        doc.path + ".sfe"
      );
    } else {
      const sourceFileDir = getFileDir(doc.structureId, doc.usagerRef);
      filePath = join(sourceFileDir, doc.path + ".encrypted");
    }

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

    if (!doc) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json({ message: "DOC_NOT_FOUND" });
    }

    if (doc.encryptionContext) {
      const mainSecret = domifaConfig().security.files.mainSecret;

      const encryptedFilePath = await getFilePath(
        user.structure.uuid,
        doc.usagerUUID,
        doc.path + ".sfe"
      );

      if (doc.encryptionVersion !== 0) {
        return res
          .status(HttpStatus.INTERNAL_SERVER_ERROR)
          .json({ message: "CANNOT_UPLOAD_FILE_MAIN" });
      }

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

    // @deprecated
    else {
      // @deprecated: delete this after migration
      const sourceFileDir = getFileDir(
        currentUsager.structureId,
        currentUsager.ref
      );
      // Encrypted file source
      const encryptedFilePath = join(sourceFileDir, doc.path + ".encrypted");

      // FIX : vieilles données pas encore encryptés
      if (!(await pathExists(encryptedFilePath))) {
        const oldFilePath = join(sourceFileDir, doc.path);
        if (!(await pathExists(oldFilePath))) {
          appLogger.error("Error reading usager document", {
            sentry: true,
            context: {
              oldFilePath,
            },
          });
          return res
            .status(HttpStatus.BAD_REQUEST)
            .json({ message: "DOC_NOT_FOUND" });
        }

        try {
          await this.saveEncryptedFile(user, doc);
        } catch (e) {
          return res
            .status(HttpStatus.INTERNAL_SERVER_ERROR)
            .json({ message: "CANNOT_OPEN_FILE" });
        }
      }

      // TEMP FIX : Utiliser la deuxième clé d'encryptage générée le 30 juin
      // A supprimer une fois que les fichiers seront de nouveaux regénérés
      const docInfos = await stat(encryptedFilePath);

      const iv =
        docInfos.mtime < new Date("2021-06-30T23:01:01.113Z")
          ? domifaConfig().security.files.ivSecours
          : domifaConfig().security.files.iv;

      try {
        const key = domifaConfig().security.files.private;
        const decipher = createDecipheriv("aes-256-cfb", key, iv);

        return createReadStream(encryptedFilePath).pipe(decipher).pipe(res);
      } catch (e) {
        return res
          .status(HttpStatus.INTERNAL_SERVER_ERROR)
          .json({ message: "CANNOT_OPEN_FILE" });
      }
    }
  }

  // encrypt a cleartext file to sfe and delete original
  private async saveEncryptedFile(
    user: UserStructureAuthenticated,
    usagerDoc: UsagerDoc
  ): Promise<void | Error> {
    const sourceFilePath = await getFilePath(
      user.structure.uuid,
      usagerDoc.usagerUUID,
      usagerDoc.path
    );

    const fileExist = await pathExists(sourceFilePath);
    if (!fileExist) {
      appLogger.error(`Fichier inexistant : ${sourceFilePath}`);
      return new Error(`Fichier inexistant : ${sourceFilePath}`);
    }

    try {
      const mainSecret = domifaConfig().security.files.mainSecret;
      if (
        usagerDoc.filetype === "image/jpeg" ||
        usagerDoc.filetype === "image/png"
      ) {
        await pipeline(
          createReadStream(sourceFilePath),
          compressAndResizeImage(usagerDoc),
          encryptFile(mainSecret, usagerDoc.encryptionContext),
          createWriteStream(sourceFilePath + ".sfe")
        );
      } else {
        await pipeline(
          createReadStream(sourceFilePath),
          encryptFile(mainSecret, usagerDoc.encryptionContext),
          createWriteStream(sourceFilePath + ".sfe")
        );
      }
    } catch (e) {
      appLogger.error(e);
      return new Error(
        `Erreur de chiffrement : ${sourceFilePath} ${e.message}`
      );
    } finally {
      await usagerDocsRepository.delete({
        uuid: usagerDoc.uuid,
      });

      await deleteFile(sourceFilePath);
    }
  }
}
