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
  deleteFile,
  getFileDir,
  getFilePath,
  randomName,
  validateUpload,
} from "../../util/FileManager";
import {
  UsagerDoc,
  UsagerLight,
  UserStructureAuthenticated,
} from "../../_common/model";

import { AppLogsService } from "../../modules/app-logs/app-logs.service";
import { UploadUsagerDocDto } from "../dto";
import {
  createReadStream,
  createWriteStream,
  ensureDir,
  pathExists,
  remove,
  stat,
} from "fs-extra";
import { join } from "path";
import { createCipheriv, createDecipheriv } from "crypto";
import { ExpressRequest } from "../../util/express";

@UseGuards(AuthGuard("jwt"), AppUserGuard, UsagerAccessGuard)
@ApiTags("docs")
@ApiBearerAuth()
@Controller("docs")
export class UsagerDocsController {
  constructor(private readonly appLogsService: AppLogsService) {}

  @ApiOperation({ summary: "Upload de pièces jointes" })
  @Post(":usagerRef")
  @AllowUserStructureRoles("simple", "responsable", "admin")
  @UseInterceptors(
    FileInterceptor("file", {
      limits: {
        fieldSize: 10 * 1024 * 1024,
        files: 1,
      },
      fileFilter: (req: ExpressRequest, file: Express.Multer.File, cb: any) => {
        if (!validateUpload("USAGER_DOC", req, file)) {
          throw new HttpException("INCORRECT_FORMAT", HttpStatus.BAD_REQUEST);
        }
        cb(null, true);
      },
      storage: diskStorage({
        destination: async (req: any, _file: Express.Multer.File, cb: any) => {
          const dir = getFileDir(req.user.structureId, req.usager.ref);

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
    @Param("usagerRef") usagerRef: number,
    @UploadedFile() file: Express.Multer.File,
    @Body() postData: UploadUsagerDocDto,
    @CurrentUser() user: UserStructureAuthenticated,
    @CurrentUsager() currentUsager: UsagerLight,
    @Res() res: Response
  ) {
    try {
      await this.encryptFile(currentUsager, file.filename);
    } catch (e) {
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ message: "CANNOT_ENCRYPT_FILE" });
    }

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
    };

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
    @Param("usagerRef") usagerRef: number,
    @Param("docUuid", new ParseUUIDPipe()) docUuid: string,
    @CurrentUser() user: UserStructureAuthenticated,
    @CurrentUsager() currentUsager: UsagerLight,
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

    const filePath = getFilePath(
      currentUsager.structureId,
      currentUsager.ref,
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
    @Param("usagerRef") usagerRef: number,
    @CurrentUsager() currentUsager: UsagerLight
  ): Promise<UsagerDoc[]> {
    return await usagerDocsRepository.getUsagerDocs(
      usagerRef,
      currentUsager.structureId
    );
  }

  @Get(":usagerRef/:docUuid")
  @AllowUserStructureRoles("simple", "responsable", "admin")
  public async getDocument(
    @Param("usagerRef") usagerRef: number,
    @Param("docUuid", new ParseUUIDPipe()) docUuid: string,
    @Res() res: Response,
    @CurrentUsager() currentUsager: UsagerLight
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
        await this.encryptFile(currentUsager, doc.path);
      } catch (e) {
        return res
          .status(HttpStatus.INTERNAL_SERVER_ERROR)
          .json({ message: "CANNOT_OPEN_FILE" });
      }
    }

    // Outputs file & path
    const outputFolder = join(domifaConfig().upload.basePath, "tmp");
    const outputFilePath = join(outputFolder, doc.path);

    // Création du dossier temporaire de réception des fichiers déchiffrés
    await ensureDir(outputFolder);

    // Si jamais le fichier décrypté existe déjà, on le supprime
    await remove(outputFilePath);

    // TEMP FIX : Utiliser la deuxième clé d'encryptage générée le 30 juin
    // A supprimer une fois que les fichiers seront de nouveaux regénérés
    const docInfos = await stat(encryptedFilePath);
    const iv =
      docInfos.mtime < new Date("2021-06-30T23:01:01.113Z")
        ? domifaConfig().security.files.ivSecours
        : domifaConfig().security.files.iv;

    try {
      await this.decryptFile(encryptedFilePath, outputFilePath, iv);
      return res.status(HttpStatus.OK).sendFile(outputFilePath);
    } catch (e) {
      console.log({
        inputFile: await stat(encryptedFilePath),
        outputFile: await stat(outputFilePath),
      });
      console.log(e);
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ message: "CANNOT_OPEN_FILE" });
    }
  }

  private async decryptFile(
    encryptedFilePath: string,
    outputFilePath: string,
    iv: string
  ): Promise<void | Error> {
    return new Promise((resolve, reject) => {
      // Clés de chiffrement
      const key = domifaConfig().security.files.private;

      const decipher = createDecipheriv("aes-256-cfb", key, iv);
      const input = createReadStream(encryptedFilePath);

      const output = createWriteStream(outputFilePath);

      input.pipe(decipher).pipe(output);

      output.on("error", (error: Error) => {
        console.log(error);
        appLogger.error("[FILES] CANNOT_DECRYPT_FILE : " + outputFilePath, {
          error,
          sentry: true,
        });
        reject(error);
      });

      output.on("finish", () => {
        resolve();
      });
    });
  }

  private async encryptFile(
    usager: UsagerLight,
    fileName: string
  ): Promise<void | Error> {
    return new Promise((resolve, reject) => {
      const filePath = getFilePath(usager.structureId, usager.ref, fileName);

      const key = domifaConfig().security.files.private;
      const iv = domifaConfig().security.files.iv;

      const cipher = createCipheriv("aes-256-cfb", key, iv);

      const input = createReadStream(filePath);
      const output = createWriteStream(filePath + ".encrypted");

      input.pipe(cipher).pipe(output);

      output.on("error", async (error: Error) => {
        console.log(error);
        appLogger.error("[FILES] CANNOT_ENCRYPT_FILE : " + filePath, {
          sentry: true,
          error,
        });
        await remove(filePath);
        reject(error);
      });

      output.on("finish", async () => {
        await remove(filePath);
        resolve();
      });
    });
  }
}
