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

import * as fse from "fs-extra";
import { diskStorage } from "multer";
import * as os from "os";
import * as path from "path";
import { CurrentUser } from "../../../auth/decorators/current-user.decorator";
import { AppUserGuard } from "../../../auth/guards";
import { structureCommonRepository } from "../../../database";
import { appLogger } from "../../../util";
import { ExpressRequest, ExpressResponse } from "../../../util/express";
import { randomName, validateUpload } from "../../../util/FileManager";
import {
  COUNTRY_CODES_TIMEZONE,
  UserStructureAuthenticated,
} from "../../../_common/model";
import { ImportProcessTracker } from "./ImportProcessTracker.type";
import {
  ImportPreviewColumn,
  ImportPreviewRow,
  ImportPreviewTable,
  UsagersImportError,
  UsagersImportRow,
} from "./model";
import { usagersImportExcelParser } from "./step1-parse-excel";
import {
  UsagersImportUsager,
  usagersImportValidator,
} from "./step2-validate-row";
import { usagersImportCreator } from "./step3-create";

import { AllowUserStructureRoles } from "../../../auth/decorators";
import { addYears, endOfDay, startOfYear } from "date-fns";

const USAGERS_IMPORT_DIR = path.join(os.tmpdir(), "domifa", "usagers-imports");

const UsagersImportFileInterceptor = FileInterceptor("file", {
  limits: {
    fieldSize: 10 * 1024 * 1024,
    files: 1,
  },
  fileFilter: (req: ExpressRequest, file: Express.Multer.File, cb: any) => {
    if (!validateUpload("IMPORT", req, file)) {
      return cb("INCORRECT_FORMAT", false);
    }
    cb(null, true);
  },
  storage: diskStorage({
    destination: async (
      _req: ExpressRequest,
      _file: Express.Multer.File,
      cb: any
    ) => {
      const dir = USAGERS_IMPORT_DIR;
      if (!(await fse.pathExists(dir))) {
        await fse.ensureDir(dir);
      }
      cb(null, dir);
    },

    filename: (_req: ExpressRequest, file: Express.Multer.File, cb: any) => {
      return cb(null, randomName(file));
    },
  }),
});

type UsagersImportMode = "preview" | "confirm";

@UseGuards(AuthGuard("jwt"), AppUserGuard)
@ApiTags("import")
@ApiBearerAuth()
@Controller("import")
export class ImportController {
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
    const filePath = path.resolve(USAGERS_IMPORT_DIR, fileName);

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

      const previewTable: ImportPreviewTable = {
        isValid: false,
        totalCount: importPreviewRows.length,
        errorsCount: importErrors.length,
        // keep only errors, limit to 50 results
        rows: importPreviewRows.filter(({ isValid }) => !isValid).slice(0, 50),
      };

      return res.status(HttpStatus.BAD_REQUEST).json({ previewTable });
    }

    try {
      await fse.remove(filePath);
      appLogger.debug("[FILES] Delete import file success " + filePath);
    } catch (err) {
      appLogger.error("[FILES] [FAIL] Delete import file fail " + filePath);
    }

    if (importMode === "preview") {
      const previewTable: ImportPreviewTable = {
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

    await usagersImportCreator.createFromImport({
      usagersRows,
      user,
      processTracker,
    });

    await structureCommonRepository.updateOne(
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
    const previewTable: ImportPreviewTable = {
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
