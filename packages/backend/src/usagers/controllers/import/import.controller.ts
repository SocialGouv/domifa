import { structureRepository } from "./../../../database/services/structure/structureRepository.service";
import {
  Controller,
  HttpStatus,
  Param,
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
import {
  COUNTRY_CODES_TIMEZONE,
  UserStructureAuthenticated,
} from "../../../_common/model";
import { ImportProcessTracker } from "./ImportProcessTracker.type";
import { UsagersImportError, UsagersImportRow } from "./model";
import { usagersImportExcelParser } from "./step1-parse-excel";
import {
  UsagersImportUsager,
  usagersImportValidator,
} from "./step2-validate-row";
import os from "os";
import { AllowUserStructureRoles } from "../../../auth/decorators";
import { addYears, endOfDay, startOfYear } from "date-fns";
import { ensureDir, pathExists, remove } from "fs-extra";
import { join, resolve } from "path";
import { FILES_SIZE_LIMIT } from "../../../util/file-manager";
import {
  ImportPreviewTable,
  ImportPreviewRow,
  ImportPreviewColumn,
} from "@domifa/common";
import { ImportCreatorService } from "./step3-create";

const USAGERS_IMPORT_DIR = join(os.tmpdir(), "domifa", "usagers-imports");

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
    destination: (
      _req: ExpressRequest,
      _file: Express.Multer.File,
      callback: (error: Error | null, destination: string) => void
    ) => {
      (async () => {
        try {
          const dir = USAGERS_IMPORT_DIR;
          if (!(await pathExists(dir))) {
            await ensureDir(dir);
          }
          callback(null, dir);
        } catch (error) {
          callback(error, "");
        }
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
});

type UsagersImportMode = "preview" | "confirm";

@UseGuards(AuthGuard("jwt"), AppUserGuard)
@ApiTags("import")
@ApiBearerAuth()
@Controller("import")
export class ImportController {
  constructor(private readonly importCreatorService: ImportCreatorService) {}

  @Post(":mode")
  @AllowUserStructureRoles("simple", "responsable", "admin")
  @UseInterceptors(UsagersImportFileInterceptor)
  public async importExcel(
    @Param("mode") importMode: UsagersImportMode,
    @Res() res: ExpressResponse,
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: UserStructureAuthenticated
  ) {
    if (importMode !== "preview" && importMode !== "confirm") {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json({ message: "IMPORT_MODE_FAIL" });
    }

    const processTracker: ImportProcessTracker = {
      start: new Date(),
      read: {
        start: new Date(),
      },
    };

    const fileName = file.filename;
    const filePath = resolve(USAGERS_IMPORT_DIR, fileName);

    let usagerImportRows: {
      rowNumber: number;
      row: UsagersImportRow;
    }[] = [];

    try {
      usagerImportRows = await usagersImportExcelParser.parseFileSync(filePath);
      processTracker.data = { count: usagerImportRows.length };
    } catch (err) {
      appLogger.error(`Import unexpected error while opening upload file`, {
        sentry: true,
        context: {
          err,
          fileName,
        },
      });
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json({ message: "EXCEL_FILE_CORRUPTED" });
    }

    let previewTable: ImportPreviewTable;
    const today = endOfDay(new Date());
    const nextYear = addYears(endOfDay(new Date()), 1);
    const minDate = startOfYear(new Date("1900-01-01"));

    const structureId = user.structureId;
    const importContext = { fileName, filePath, structureId };

    let importErrors: UsagersImportError[] = [];
    const importPreviewRows: ImportPreviewRow[] = [];

    const usagersRows: UsagersImportUsager[] = [];

    const maxErrors = 20;

    processTracker.read.end = new Date();
    processTracker.read.duration =
      (processTracker.read.end.getTime() -
        processTracker.read.start.getTime()) /
      1000;
    processTracker.parse = {
      start: new Date(),
    };
    for (
      let rowIndex = 0, len = usagerImportRows.length;
      rowIndex < len && importErrors.length < maxErrors;
      rowIndex++
    ) {
      // Ligne
      const { row, rowNumber } = usagerImportRows[rowIndex];

      const { usagerRow, errors } =
        await usagersImportValidator.parseAndValidate({
          row,
          rowNumber,
          context: {
            minDate,
            nextYear,
            today,
            countryCode: COUNTRY_CODES_TIMEZONE[user.structure.timeZone],
          },
        });
      if (errors.length || importMode === "preview") {
        importErrors = importErrors.concat(errors);
        importPreviewRows.push({
          isValid: errors.length === 0,
          rowNumber,
          columns: row.reduce(
            (acc, value, i) => {
              acc[i] = {
                value,
                isValid: !errors.find((err) => err.columnNumber === i + 1),
              };
              return acc;
            },
            {} as {
              [attributeName: string]: ImportPreviewColumn;
            }
          ),
          errorsCount: errors.length,
        });
      } else if (usagerRow) {
        usagersRows.push(usagerRow);
      }
    }

    processTracker.parse.end = new Date();
    processTracker.parse.duration =
      (processTracker.parse.end.getTime() -
        processTracker.parse.start.getTime()) /
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
        rows: importPreviewRows.filter(({ isValid }) => !isValid).slice(0, 50),
      };

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
}
