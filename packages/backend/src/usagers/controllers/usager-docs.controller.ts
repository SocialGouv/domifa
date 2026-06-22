import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  ParseEnumPipe,
  ParseIntPipe,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { FileInterceptor } from "@nestjs/platform-express";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";

import {
  AllowUserProfiles,
  AllowUserStructureRoles,
  CurrentUsagerDoc,
} from "../../auth/decorators";
import { CurrentUsager } from "../../auth/decorators/current-usager.decorator";
import { CurrentUser } from "../../auth/decorators/current-user.decorator";
import { AppUserGuard, UsagerDocAccessGuard } from "../../auth/guards";
import { UsagerAccessGuard } from "../../auth/guards/usager-access.guard";

import {
  cleanPath,
  randomName,
  validateUpload,
} from "../../util/file-manager/FileManager";
import { UserStructureAuthenticated } from "../../_common/model";
import { AppLogsService } from "../../modules/app-logs/app-logs.service";
import {
  buildStructureActorFields,
  buildUsagerFields,
} from "../../modules/app-logs/app-logs.helpers";
import { PatchUsagerDocDto, PostUsagerDocDto } from "../dto";

import crypto from "node:crypto";
import { ExpressRequest } from "../../util/express";
import { FILES_SIZE_LIMIT } from "../../util/file-manager";
import { join, resolve } from "node:path";
import { FileManagerService } from "../../util/file-manager/file-manager.service";
import { BehavioralQuotaEnforcerService } from "../../modules/security-monitoring/services/behavioral-quota-enforcer.service";
import { CerfaDocType, Usager, UsagerDoc } from "@domifa/common";
import {
  USAGER_DOCS_FIELDS_TO_SELECT,
  usagerDocsRepository,
  UsagerDocsTable,
} from "../../database";
import { Response } from "express";
import { appLogger } from "../../util";
import { input } from "node-pdftk";
import { generateCerfaData } from "../utils";
import { readFile } from "fs-extra";

@UseGuards(AuthGuard("jwt"), AppUserGuard)
@ApiTags("docs")
@ApiBearerAuth()
@Controller("docs")
@AllowUserProfiles("structure")
@AllowUserStructureRoles("simple", "responsable", "admin")
export class UsagerDocsController {
  constructor(
    private readonly appLogsService: AppLogsService,
    private readonly fileManagerService: FileManagerService,
    private readonly quotaEnforcer: BehavioralQuotaEnforcerService
  ) {}

  @ApiOperation({
    summary: "Téléverser des pièces-jointes dans le dossier d'un usager",
  })
  @Post(":usagerRef")
  @UseGuards(UsagerAccessGuard)
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
    if (
      !user.structure.portailUsager?.enabledByStructure ||
      !currentUsager.options?.portailUsagerEnabled
    ) {
      postData.shared = false;
    }

    const encryptionContext = crypto.randomUUID();
    const userName = `${user.prenom} ${user.nom}`;

    const path = randomName(file);
    const filesize = file.buffer ? file.buffer.length : file.size;

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
      filesize,
      shared: postData.shared ?? false,
    });

    try {
      const filePath = join(
        "usager-documents",
        cleanPath(user.structure.uuid),
        cleanPath(currentUsager.uuid),
        `${path}.sfe`
      );

      await this.fileManagerService.saveEncryptedFile(filePath, newDoc, file);
    } catch (e) {
      appLogger.error(e);
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ message: "CANNOT_ENCRYPT_FILE" });
    }

    await this.appLogsService.create({
      ...buildStructureActorFields(user),
      ...buildUsagerFields(currentUsager),
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
  @UseGuards(UsagerAccessGuard, UsagerDocAccessGuard)
  public async patchDocument(
    @Param("usagerRef", new ParseIntPipe()) _usagerRef: number,
    @Param("docUuid", new ParseUUIDPipe()) docUuid: string,
    @Body() updatedDoc: PatchUsagerDocDto,
    @CurrentUser() user: UserStructureAuthenticated,
    @CurrentUsagerDoc() usagerDoc: UsagerDoc,
    @CurrentUsager() currentUsager: Usager,
    @Res() res: Response
  ) {
    if (
      !user.structure.portailUsager?.enabledByStructure ||
      !currentUsager.options?.portailUsagerEnabled
    ) {
      usagerDoc.shared = false;
    }

    if (usagerDoc.shared) {
      await this.appLogsService.create({
        ...buildStructureActorFields(user),
        ...buildUsagerFields(currentUsager),
        structureId: user.structureId,
        action: "USAGERS_DOCS_SHARED",
      });
    }

    if (usagerDoc.label !== updatedDoc.label) {
      await this.appLogsService.create({
        ...buildStructureActorFields(user),
        ...buildUsagerFields(currentUsager),
        structureId: user.structureId,
        action: "USAGERS_DOCS_RENAME",
      });
    }

    await usagerDocsRepository.update(
      {
        uuid: docUuid,
        structureId: user.structureId,
      },
      {
        label: updatedDoc.label,
        shared: updatedDoc.shared,
      }
    );

    const doc = await usagerDocsRepository.findOne({
      where: {
        uuid: docUuid,
        structureId: user.structureId,
      },
      select: USAGER_DOCS_FIELDS_TO_SELECT,
    });

    return res.status(HttpStatus.OK).json(doc);
  }

  @Delete(":usagerRef/:docUuid")
  @UseGuards(UsagerAccessGuard, UsagerDocAccessGuard)
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
      structureId: user.structureId,
    });

    await this.appLogsService.create({
      ...buildStructureActorFields(user),
      ...buildUsagerFields(currentUsager),
      structureId: user.structureId,
      action: "USAGERS_DOCS_DELETE",
    });

    const docs = await usagerDocsRepository.getUsagerDocs(
      usagerRef,
      currentUsager.structureId
    );

    return res.status(HttpStatus.OK).json(docs);
  }

  @UseGuards(UsagerAccessGuard)
  @AllowUserStructureRoles("admin", "agent", "responsable", "simple")
  @Get("cerfa/:usagerRef/:typeCerfa")
  public async getCerfa(
    @Res() res: Response,
    @Param("typeCerfa", new ParseEnumPipe(CerfaDocType))
    typeCerfa: CerfaDocType,
    @Param("usagerRef", new ParseIntPipe()) _usagerRef: number,
    @CurrentUser() user: UserStructureAuthenticated,
    @CurrentUsager() currentUsager: Usager,
    @Query("decisionUuid", new ParseUUIDPipe({ optional: true }))
    decisionUuid?: string
  ) {
    const pdfForm =
      typeCerfa === CerfaDocType.attestation ||
      typeCerfa === CerfaDocType.attestation_future
        ? "../../_static/static-docs/attestation.pdf"
        : "../../_static/static-docs/demande.pdf";

    try {
      const pdfInfos = generateCerfaData(
        currentUsager,
        user,
        typeCerfa,
        decisionUuid
      );

      const filePath = await readFile(resolve(__dirname, pdfForm));

      const buffer = await input(filePath).fillForm(pdfInfos).output();
      return res.setHeader("content-type", "application/pdf").send(buffer);
    } catch (err) {
      appLogger.error(err);

      // `decisionUuid` is a user input (query param). When it is provided but
      // not found in `usager.historique`, we should respond 400 instead of 500.
      if (decisionUuid && (err as any)?.message === "CERFA_INDEX_UNDEFINED") {
        return res
          .status(HttpStatus.BAD_REQUEST)
          .json({ message: "BAD_REQUEST" });
      }

      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ message: "CERFA_ERROR" });
    }
  }

  @Get(":usagerRef")
  @UseGuards(UsagerAccessGuard)
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
  @UseGuards(UsagerAccessGuard, UsagerDocAccessGuard)
  public async getDocument(
    @Param("docUuid", new ParseUUIDPipe()) docUuid: string,
    @Param("usagerRef", new ParseIntPipe()) usagerRef: number,
    @Res() res: Response,
    @CurrentUser() user: UserStructureAuthenticated,
    @CurrentUsager() currentUsager: Usager
  ) {
    const enforcement = await this.quotaEnforcer.enforceBeforeAction({
      action: "USAGERS_DOCS_DOWNLOAD",
      user,
    });
    if (!enforcement.allowed) {
      return res
        .status(HttpStatus.TOO_MANY_REQUESTS)
        .json({ message: "QUOTA_EXCEEDED" });
    }

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

    await this.appLogsService.create({
      ...buildStructureActorFields(user),
      ...buildUsagerFields(currentUsager),
      structureId: user.structureId,
      action: "USAGERS_DOCS_DOWNLOAD",
    });

    try {
      const filePath = join(
        "usager-documents",
        cleanPath(user.structure.uuid),
        cleanPath(doc.usagerUUID),
        `${doc.path}.sfe`
      );

      return await this.fileManagerService.dowloadEncryptedFile(
        res,
        filePath,
        doc
      );
    } catch (e) {
      appLogger.error(e);
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ message: "CANNOT_DOWNLOAD_FILE" });
    }
  }
}
