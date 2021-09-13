import {
  Controller,
  HttpException,
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
import * as fs from "fs";
import { diskStorage } from "multer";
import * as os from "os";
import * as path from "path";
import { CurrentUser } from "../../../auth/current-user.decorator";
import { AllowUserStructureRoles, AppUserGuard } from "../../../auth/guards";
import { structureCommonRepository } from "../../../database";
import { appLogger } from "../../../util";
import { ExpressResponse } from "../../../util/express";
import { randomName, validateUpload } from "../../../util/FileManager";
import { UserStructureAuthenticated } from "../../../_common/model";
import { UsagersService } from "../../services/usagers.service";
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

import moment = require("moment");

const USAGERS_IMPORT_DIR = path.join(os.tmpdir(), "domifa", "usagers-imports");

const UsagersImportFileInterceptor = FileInterceptor("file", {
  limits: {
    fieldSize: 10 * 1024 * 1024,
    files: 1,
  },
  fileFilter: (req: any, file: Express.Multer.File, cb: any) => {
    if (!validateUpload("IMPORT", req, file)) {
      throw new HttpException("INCORRECT_FORMAT", HttpStatus.BAD_REQUEST);
    }
    cb(null, true);
  },
  storage: diskStorage({
    destination: (req: any, file: Express.Multer.File, cb: any) => {
      const dir = USAGERS_IMPORT_DIR;
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      cb(null, dir);
    },

    filename: (req: any, file: Express.Multer.File, cb: any) => {
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
  constructor(private readonly usagersService: UsagersService) {}

  @Post(":mode")
  @AllowUserStructureRoles("simple", "responsable", "admin")
  @UseInterceptors(UsagersImportFileInterceptor)
  public async importExcel(
    @Param("mode") importMode: UsagersImportMode,
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
        extra: {
          err,
          fileName,
        },
      });
      throw new HttpException(err, HttpStatus.BAD_REQUEST);
    }

    const today = moment.utc().endOf("day").toDate();
    const nextYear = moment.utc().add(1, "year").endOf("day").toDate();
    const minDate = moment
      .utc("01/01/1900", "DD/MM/YYYY")
      .endOf("day")
      .toDate();

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
        extra: {
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

      throw new HttpException({ previewTable }, HttpStatus.BAD_REQUEST);
    }

    try {
      fs.unlinkSync(filePath);
    } catch (err) {
      throw new HttpException(
        "IMPORTE_DELETE_FILE_IMPOSSIBLE",
        HttpStatus.BAD_REQUEST
      );
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
