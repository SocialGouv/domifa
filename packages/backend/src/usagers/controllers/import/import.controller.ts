import { structureRepository } from "../../../database";
import {
  Controller,
  Get,
  HttpStatus,
  Param,
  ParseEnumPipe,
  Post,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { FileInterceptor } from "@nestjs/platform-express";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { diskStorage } from "multer";
import { CurrentUser } from "../../../auth/decorators/current-user.decorator";
import { AppUserGuard } from "../../../auth/guards";
import { appLogger } from "../../../util";
import { ExpressRequest, ExpressResponse } from "../../../util/express";
import {
  randomName,
  validateUpload,
} from "../../../util/file-manager/FileManager";
import { UserStructureAuthenticated } from "../../../_common/model";
import { ImportProcessTracker } from "./ImportProcessTracker.type";
import { ImportParseAndValidateResult } from "./parseAndValidateImportFile";
import {
  ImportRunnerError,
  usagersImportRunner,
} from "./usagersImportRunner.service";

import {
  AllowUserProfiles,
  AllowUserStructureRoles,
} from "../../../auth/decorators";
import { addYears, endOfDay, startOfYear } from "date-fns";
import { remove } from "fs-extra";

import { FILES_SIZE_LIMIT } from "../../../util/file-manager";
import {
  ImportPreviewTable,
  COUNTRY_CODES_TIMEZONE,
  UsagersImportMode,
  ImportDocumentType,
} from "@domifa/common";
import { ImportCreatorService } from "./step3-create";
import { AppLogsService } from "../../../modules/app-logs/app-logs.service";
import { buildStructureActorFields } from "../../../modules/app-logs/app-logs.helpers";
import {
  FailedUsagerImportLogContext,
  SuccessfulUsagerImportLogContext,
} from "../../../modules/app-logs/types/app-log-context.types";

const UsagersImportFileInterceptor = FileInterceptor("file", {
  limits: FILES_SIZE_LIMIT,
  fileFilter: (
    req: ExpressRequest,
    file: Express.Multer.File,
    callback: (error: Error | null, acceptFile: boolean) => void
  ) => {
    if (!validateUpload("IMPORT", req, file)) {
      return callback(new Error("INCORRECT_FORMAT"), false);
    }
    callback(null, true);
  },
  storage: diskStorage({
    filename: (
      _req,
      file: Express.Multer.File,
      callback: (error: Error | null, destination: string) => void
    ) => {
      return callback(null, randomName(file));
    },
  }),
});

@UseGuards(AuthGuard("jwt"), AppUserGuard)
@ApiTags("import")
@ApiBearerAuth()
@Controller("import")
@AllowUserStructureRoles("responsable", "admin")
@AllowUserProfiles("structure")
export class ImportController {
  constructor(
    private readonly importCreatorService: ImportCreatorService,
    private readonly appLogsService: AppLogsService
  ) {}

  @Post(":mode")
  @UseInterceptors(UsagersImportFileInterceptor)
  public async importExcel(
    @Param("mode", new ParseEnumPipe(UsagersImportMode))
    importMode: UsagersImportMode,
    @Res() res: ExpressResponse,
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: UserStructureAuthenticated
  ) {
    const processTracker: ImportProcessTracker = {
      start: new Date(),
      read: {
        start: new Date(),
      },
    };

    const fileName = file.filename;
    const filePath = file.path;

    let previewTable: ImportPreviewTable;
    const today = endOfDay(new Date());
    const nextYear = addYears(endOfDay(new Date()), 1);
    const minDate = startOfYear(new Date("1900-01-01"));

    const structureId = user.structureId;
    const importContext = { fileName, filePath, structureId };
    const maxErrors = 20;

    // Parse + validation dans un WORKER THREAD, borné dans le temps. Un fichier
    // xlsx pathologique (bombe de décompression, plage de colonnes dégénérée)
    // parsé en synchrone sur le thread principal a gelé la prod le 11/08 : il
    // tenait un cœur ~50 s et l'event loop du pod ne répondait plus à rien,
    // /healthz compris. L'isolation en worker garde le pod réactif, et le
    // timeout coupe un fichier hostile — impossible sur le thread principal, où
    // un blocage synchrone empêche le callback du timeout de se déclencher.
    let parseResult: ImportParseAndValidateResult;
    try {
      parseResult = await usagersImportRunner.parseAndValidate({
        filePath,
        importMode,
        context: {
          minDate,
          nextYear,
          today,
          countryCode: COUNTRY_CODES_TIMEZONE[user.structure.timeZone],
        },
        maxErrors,
      });
      processTracker.data = { count: parseResult.totalCount };
    } catch (err) {
      const code = (err as ImportRunnerError)?.code;
      appLogger.error(`Import parse/validate failed (${code ?? "unknown"})`, {
        sentry: true,
        context: { ...importContext, code, err },
      });
      const message =
        code === "IMPORT_TIMEOUT" || code === "IMPORT_TOO_MANY_ROWS"
          ? code
          : "EXCEL_FILE_CORRUPTED";
      return res.status(HttpStatus.BAD_REQUEST).json({ message });
    }

    const {
      importErrors,
      importPreviewRows,
      usagersRows,
      previewUsagersRow,
    } = parseResult;

    processTracker.read.end = new Date();
    processTracker.read.duration =
      (processTracker.read.end.getTime() -
        processTracker.read.start.getTime()) /
      1000;
    processTracker.build = {
      start: new Date(),
    };
    if (importErrors.length) {
      appLogger.error(`Import error for structure ${structureId}`, {
        sentry: true,
        context: {
          ...importContext,
          importErrors,
        },
      });

      previewTable = {
        isValid: false,
        totalCount: importPreviewRows.length,
        errorsCount: importErrors.length,
        // keep only errors, limit to 50 results
        rows: [...importPreviewRows]
          .filter(({ isValid }) => !isValid)
          .slice(0, 50),
      };
      await this.appLogsService.create<FailedUsagerImportLogContext>({
        ...buildStructureActorFields(user),
        action: "IMPORT_USAGERS_FAILED",
        structureId: user.structureId,
        context: {
          nombreActifs: previewUsagersRow.length,
          nombreErreurs: importErrors.length,
          nombreTotal: importPreviewRows.length,
        },
      });

      return res.status(HttpStatus.BAD_REQUEST).json({ previewTable });
    }

    try {
      await remove(filePath);
      appLogger.debug("[FILES] Delete import file success " + filePath);
    } catch (err) {
      appLogger.error("[FILES] [FAIL] Delete import file fail " + filePath);
    }

    if (importMode === "preview") {
      previewTable = {
        isValid: true,
        totalCount: importPreviewRows.length,
        errorsCount: importErrors.length,
        rows: importPreviewRows.slice(0, 50), // limit to 50 results
      };

      await this.appLogsService.create<SuccessfulUsagerImportLogContext>({
        ...buildStructureActorFields(user),
        action: "IMPORT_USAGERS_PREVIEW",
        structureId: user.structureId,
        context: {
          nombreActifs: previewUsagersRow.length,
          nombreTotal: importPreviewRows.length,
        },
      });

      return res.status(HttpStatus.OK).json({
        importMode,
        previewTable,
      });
    }

    await this.importCreatorService.createFromImport({
      usagersRows,
      user,
      processTracker,
    });

    await structureRepository.update(
      { id: user.structureId },
      { import: true, importDate: new Date() }
    );

    processTracker.end = new Date();
    processTracker.duration =
      (processTracker.end.getTime() - processTracker.start.getTime()) / 1000;

    appLogger.debug(
      `[import.controller] SUCCESS: ${JSON.stringify(
        processTracker,
        undefined,
        2
      )}`
    );

    previewTable = {
      isValid: true,
      totalCount: importPreviewRows.length,
      errorsCount: importErrors.length,
      rows: [], // don't return rows
    };
    return res.status(HttpStatus.OK).json({
      importMode,
      previewTable,
    });
  }

  @Get("log-document-download/:documentType")
  public async logDocumentDownload(
    @CurrentUser()
    user: UserStructureAuthenticated,
    @Param("documentType", new ParseEnumPipe(ImportDocumentType))
    documentType: ImportDocumentType
  ) {
    await this.appLogsService.create({
      ...buildStructureActorFields(user),
      structureId: user.structureId,
      action:
        documentType === ImportDocumentType.GUIDE
          ? "IMPORT_DOWNLOAD_GUIDE"
          : "IMPORT_TEMPLATE_DOWNLOAD",
    });
  }
}
