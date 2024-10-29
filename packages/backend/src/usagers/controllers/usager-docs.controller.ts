import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Patch,
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

import {
  AllowUserStructureRoles,
  CurrentUsagerDoc,
} from "../../auth/decorators";
import { CurrentUsager } from "../../auth/decorators/current-usager.decorator";
import { CurrentUser } from "../../auth/decorators/current-user.decorator";
import { AppUserGuard, UsagerDocAccessGuard } from "../../auth/guards";
import { UsagerAccessGuard } from "../../auth/guards/usager-access.guard";
import { domifaConfig } from "../../config";

import {
  cleanPath,
  compressAndResizeImage,
  randomName,
  validateUpload,
} from "../../util/file-manager/FileManager";
import { UserStructureAuthenticated } from "../../_common/model";
import { AppLogsService } from "../../modules/app-logs/app-logs.service";
import { PatchUsagerDocDto, PostUsagerDocDto } from "../dto";

import crypto from "node:crypto";
import { ExpressRequest } from "../../util/express";
import {
  decryptFile,
  encryptFile,
} from "@socialgouv/streaming-file-encryption";
import { pipeline } from "node:stream/promises";
import { FILES_SIZE_LIMIT } from "../../util/file-manager";
import { PassThrough, Readable } from "node:stream";
import { join } from "node:path";
import { FileManagerService } from "../../util/file-manager/file-manager.service";
import { Usager, UsagerDoc } from "@domifa/common";
import {
  USAGER_DOCS_FIELDS_TO_SELECT,
  usagerDocsRepository,
  UsagerDocsTable,
} from "../../database";

@UseGuards(AuthGuard("jwt"), AppUserGuard, UsagerAccessGuard)
@ApiTags("docs")
@ApiBearerAuth()
@Controller("docs")
export class UsagerDocsController {
  constructor(
    private readonly appLogsService: AppLogsService,
    private readonly fileManagerService: FileManagerService
  ) {}

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
    @Body() postData: PostUsagerDocDto,
    @Res() res: Response
  ) {
    const encryptionContext = crypto.randomUUID();
    const userName = `${user.prenom} ${user.nom}`;

    const path = randomName(file);

    const newDoc: UsagerDocsTable = new UsagerDocsTable({
      createdAt: new Date(),
      createdBy: userName,
      filetype: file.mimetype,
      label: postData.label,
      path,
      usagerRef,
      structureId: currentUsager.structureId,
      usagerUUID: currentUsager.uuid,
      encryptionContext,
      encryptionVersion: 0,
    });

    try {
      const filePath = join(
        "usager-documents",
        cleanPath(user.structure.uuid),
        cleanPath(currentUsager.uuid),
        `${path}.sfe`
      );

      await this.saveEncryptedFile(filePath, newDoc, file);
    } catch (e) {
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ message: "CANNOT_ENCRYPT_FILE" });
    }

    await this.appLogsService.create({
      userId: user.id,
      usagerRef,
      structureId: user.structureId,
      action: "USAGERS_DOCS_UPLOAD",
    });

    await usagerDocsRepository.save(newDoc);

    const docs = await usagerDocsRepository.getUsagerDocs(
      usagerRef,
      currentUsager.structureId
    );

    return res.status(HttpStatus.OK).json(docs);
  }

  @Patch(":usagerRef/:docUuid")
  @UseGuards(UsagerDocAccessGuard)
  @AllowUserStructureRoles("simple", "responsable", "admin")
  public async patchDocument(
    @Param("usagerRef", new ParseIntPipe()) _usagerRef: number,
    @Param("docUuid", new ParseUUIDPipe()) docUuid: string,
    @Body() updatedDoc: PatchUsagerDocDto,
    @CurrentUser() user: UserStructureAuthenticated,
    @CurrentUsagerDoc() usagerDoc: UsagerDoc,
    @CurrentUsager() currentUsager: Usager,
    @Res() res: Response
  ) {
    if (updatedDoc.shared && usagerDoc.shared !== updatedDoc.shared) {
      await this.appLogsService.create({
        userId: user.id,
        usagerRef: currentUsager.ref,
        structureId: user.structureId,
        action: "USAGERS_DOCS_SHARED",
      });
    }

    if (usagerDoc.label !== updatedDoc.label) {
      await this.appLogsService.create({
        userId: user.id,
        usagerRef: currentUsager.ref,
        structureId: user.structureId,
        action: "USAGERS_DOCS_RENAME",
      });
    }

    await usagerDocsRepository.update(
      {
        uuid: docUuid,
      },
      {
        label: updatedDoc.label,
        shared: updatedDoc.shared,
      }
    );

    const doc = await usagerDocsRepository.findOne({
      where: {
        uuid: docUuid,
      },
      select: USAGER_DOCS_FIELDS_TO_SELECT,
    });

    return res.status(HttpStatus.OK).json(doc);
  }

  @Delete(":usagerRef/:docUuid")
  @UseGuards(UsagerDocAccessGuard)
  @AllowUserStructureRoles("simple", "responsable", "admin")
  public async deleteDocument(
    @Param("usagerRef", new ParseIntPipe()) usagerRef: number,
    @Param("docUuid", new ParseUUIDPipe()) _docUuid: string,
    @CurrentUser() user: UserStructureAuthenticated,
    @CurrentUsager() currentUsager: Usager,
    @CurrentUsagerDoc() usagerDoc: UsagerDoc,

    @Res() res: Response
  ) {
    await this.fileManagerService.deleteFile(usagerDoc.path);

    await usagerDocsRepository.delete({
      uuid: usagerDoc.uuid,
    });

    await this.appLogsService.create({
      userId: user.id,
      usagerRef,
      structureId: user.structureId,
      action: "USAGERS_DOCS_DELETE",
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
    return await usagerDocsRepository.getUsagerDocs(
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

    const filePath = join(
      "usager-documents",
      cleanPath(user.structure.uuid),
      cleanPath(currentUsager.uuid),
      `${doc.path}.sfe`
    );

    const mainSecret = domifaConfig().security.mainSecret;
    const body = await this.fileManagerService.getFileBody(filePath);

    await this.appLogsService.create({
      userId: user.id,
      usagerRef,
      structureId: user.structureId,
      action: "USAGERS_DOCS_DOWNLOAD",
    });

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

    await this.fileManagerService.uploadFile(filePath, passThrough);
  }
}
