import { Usager } from "./../../_common/model/usager/Usager.type";
import { UsagerDocsTable } from "./../../database/entities/usager/UsagerDocsTable.typeorm";
import { usagerDocsRepository } from "./../../database/services/usager/usagerDocsRepository.service";
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
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
  ensureDir,
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
      fileFilter: (req: ExpressRequest, file: Express.Multer.File, cb: any) => {
        if (!validateUpload("USAGER_DOC", req, file)) {
          throw new HttpException("INCORRECT_FORMAT", HttpStatus.BAD_REQUEST);
        }
        cb(null, true);
      },
      storage: diskStorage({
        destination: async (req: any, _file: Express.Multer.File, cb: any) => {
          const dir = await getNewFileDir(
            req.user.structure.uuid,
            req.usager.uuid
          );
          await ensureDir(dir);
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

    const filePath = await getFilePath(
      user.structure.uuid,
      currentUsager.uuid,
      doc.path
    );

    await deleteFile(filePath);
    await deleteFile(filePath + ".encrypted");

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
    const mainSecret = domifaConfig().security.files.mainSecret;

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

    let sourceFileDir = getFileDir(
      currentUsager.structureId,
      currentUsager.ref
    );

    if (doc.encryptionContext) {
      sourceFileDir = await getNewFileDir(user.structure.uuid, doc.usagerUUID);
      const encryptedFilePath = join(sourceFileDir, doc.path + ".sfe");

      if (doc.encryptionVersion !== 0) {
        throw new Error("Implement main secret rotation logic");
      }

      try {
        return await pipeline(
          // note: encryptedFilePath should end with .sfe, not .encrypted, to prepare for phase 3.
          createReadStream(encryptedFilePath),
          decryptFile(mainSecret, doc.encryptionContext),
          res
        );
      } catch (e) {
        appLogger.error("Erreur");
      }
    } else {
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

      await pipeline(
        createReadStream(sourceFilePath),
        compressAndResizeImage(usagerDoc),
        encryptFile(mainSecret, usagerDoc.encryptionContext),
        createWriteStream(sourceFilePath + ".sfe")
      );
    } catch (e) {
      console.error(e);
      appLogger.error("Erreur");
      return new Error(
        `Erreur de chiffrement : ${sourceFilePath} ${e.message}`
      );
    } finally {
      await deleteFile(sourceFilePath);
    }
  }
}
