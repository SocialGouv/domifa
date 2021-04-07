import {
  Controller,
  HttpException,
  HttpStatus,
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
import * as path from "path";
import { CurrentUser } from "../../../auth/current-user.decorator";
import { FacteurGuard } from "../../../auth/guards/facteur.guard";
import { structureCommonRepository } from "../../../database";
import { StructuresService } from "../../../structures/services/structures.service";
import { appLogger } from "../../../util";
import { ExpressResponse } from "../../../util/express";
import { randomName, validateUpload } from "../../../util/FileManager";
import { AppAuthUser } from "../../../_common/model";
import { UsagersService } from "../../services/usagers.service";
import { ImportProcessTracker } from "./ImportProcessTracker.type";
import { UsagersImportError } from "./model";
import {
  ImportPreviewColumn,
  ImportPreviewRow,
  ImportPreviewTable,
} from "./preview";
import { UsagersImportUsager } from "./schema";
import { usagersImportExcelParser, usagersImportValidator } from "./services";

import moment = require("moment");

@UseGuards(AuthGuard("jwt"), FacteurGuard)
@ApiTags("import")
@ApiBearerAuth()
@Controller("import")
export class ImportController {
  constructor(
    private readonly usagersService: UsagersService,
    private readonly structureService: StructuresService
  ) {}

  @Post()
  @UseInterceptors(
    FileInterceptor("file", {
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
          const dir = path.resolve(__dirname, "../../../imports/");
          if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
          }
          cb(null, dir);
        },

        filename: (req: any, file: Express.Multer.File, cb: any) => {
          return cb(null, randomName(file));
        },
      }),
    })
  )
  public async importExcel(
    @Res() res: ExpressResponse,
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: AppAuthUser
  ) {
    const processTracker: ImportProcessTracker = {
      start: new Date(),
      read: {
        start: new Date(),
      },
    };

    const fileName = file.filename;
    const filePath = path.resolve(__dirname, "../../../imports", fileName);

    const usagerImportRows = await usagersImportExcelParser.parseFileSync(
      filePath
    );
    processTracker.data = { count: usagerImportRows.length };

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

      const {
        usagerRow,
        errors,
      } = await usagersImportValidator.parseAndValidate({
        row,
        rowNumber,
        context: {
          minDate,
          nextYear,
          today,
        },
      });
      if (errors.length) {
        importErrors = importErrors.concat(errors);
        importPreviewRows.push({
          isValid: false,
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
    if (importErrors.length > 0) {
      const error = {
        ids: JSON.stringify(importErrors),
        message: "IMPORT_ERRORS_BACKEND",
      };

      appLogger.error(`Import error for structure ${structureId}`, {
        sentry: true,
        extra: {
          ...importContext,
          importErrors,
        },
      });

      const previewTable: ImportPreviewTable = {
        errorsCount: importErrors.length,
        isValid: false,
        rows: importPreviewRows,
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

    await this.usagersService.createFromImport({
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

    return res.status(HttpStatus.OK).json({ success: true });
  }
}
