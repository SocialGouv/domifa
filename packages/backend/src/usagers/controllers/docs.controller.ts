import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { FileInterceptor } from "@nestjs/platform-express";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import * as crypto from "crypto";
import { Response } from "express";
import * as fs from "fs";
import { diskStorage } from "multer";
import * as path from "path";
import { CurrentUsager } from "../../auth/current-usager.decorator";
import { CurrentUser } from "../../auth/current-user.decorator";
import { FacteurGuard } from "../../auth/guards/facteur.guard";
import { UsagerAccessGuard } from "../../auth/guards/usager-access.guard";
import { configService } from "../../config/config.service";
import { AppAuthUser } from "../../_common/model";
import { Usager } from "../interfaces/usagers";
import { DocumentsService } from "../services/documents.service";
import { UsagersService } from "../services/usagers.service";

import Sentry = require("@sentry/node");

@UseGuards(AuthGuard("jwt"), UsagerAccessGuard, FacteurGuard)
@ApiTags("docs")
@ApiBearerAuth()
@Controller("docs")
export class DocsController {
  constructor(
    private readonly usagersService: UsagersService,
    private readonly docsService: DocumentsService
  ) {}

  @ApiOperation({ summary: "Upload de pièces-jointes" })
  @Post(":id")
  @UseInterceptors(
    FileInterceptor("file", {
      fileFilter: (req: any, file: any, cb: any) => {
        const mimeTest = !file.mimetype.match(/\/(jpg|jpeg|png|gif|pdf)$/);
        const sizeTest = file.size >= 10000000;
        if (sizeTest || mimeTest) {
          throw new BadRequestException({
            fileSize: sizeTest,
            fileType: mimeTest,
          });
        }
        cb(null, true);
      },
      storage: diskStorage({
        destination: (req: any, file: any, cb: any) => {
          const dir =
            configService.get("UPLOADS_FOLDER") +
            req.user.structureId +
            "/" +
            req.usager.id;

          if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
          }
          cb(null, dir);
        },

        filename: (req: any, file: any, cb: any) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join("");
          return cb(null, `${randomName}${path.extname(file.originalname)}`);
        },
      }),
    })
  )
  public async uploadDoc(
    @Param("id") usagerId: number,
    @UploadedFile() file: any,
    // TODO: Filtrer les datas du label
    @Body() postData: any,
    @CurrentUser() user: AppAuthUser,
    @CurrentUsager() usager: Usager,
    @Res() res: Response
  ) {
    const userName = user.prenom + " " + user.nom;

    const newDoc = {
      createdAt: new Date(),
      createdBy: userName,
      filetype: file.mimetype,
      label: postData.label,
    };

    const fileName =
      configService.get("UPLOADS_FOLDER") +
      user.structureId +
      "/" +
      usagerId +
      "/" +
      file.filename;

    this.encryptFile(fileName, res);

    const toUpdate = {
      docs: usager.docs,
      docsPath: usager.docsPath,
    };

    toUpdate.docs.push(newDoc);
    toUpdate.docsPath.push(file.filename);

    const retour = await this.usagersService.patch(toUpdate, usager._id);
    if (!retour || retour === null) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json({ message: "CANNOT_ADD_FILE" });
    }

    return res
      .status(HttpStatus.OK)
      .json({ usager, message: "IMPORT_SUCCESS" });
  }

  @Delete(":id/:index")
  public async deleteDocument(
    @Param("id") usagerId: number,
    @Param("index") index: number,
    @CurrentUser() user: AppAuthUser,
    @CurrentUsager() usager: Usager,
    @Res() res: Response
  ) {
    if (
      typeof usager.docs[index] === "undefined" ||
      typeof usager.docsPath[index] === "undefined"
    ) {
      throw new HttpException(
        {
          message: "DOC_NOT_FOUND_DELETE",
          usagerId,
          structureId: usager.structureId,
        },
        HttpStatus.BAD_REQUEST
      );
    }

    const fileInfos = usager.docs[index];
    fileInfos.path = usager.docsPath[index];

    // console.log(fileInfos);

    const pathFile = path.resolve(
      configService.get("UPLOADS_FOLDER") +
        usager.structureId +
        "/" +
        usager.id +
        "/" +
        fileInfos.path
    );

    this.deleteFile(pathFile);

    this.deleteFile(pathFile + ".encrypted");

    const retour = await this.docsService.deleteDocument(usagerId, index, user);

    if (!retour || retour === null) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json({ message: "DOC_UPDATE_USAGER_IMPOSSIBLE" });
    }
    return res.status(HttpStatus.OK).json(retour);
  }

  @Get(":id/:index")
  public async getDocument(
    @Param("id") usagerId: number,
    @Param("index") index: number,
    @Res() res: Response,
    @CurrentUsager() usager: Usager
  ) {
    if (
      typeof usager.docs[index] === "undefined" ||
      typeof usager.docsPath[index] === "undefined"
    ) {
      throw new HttpException(
        {
          message: "DOC_NOT_FOUND_GET",
          usagerId,
          structureId: usager.structureId,
        },
        HttpStatus.BAD_REQUEST
      );
    }

    const fileInfos = usager.docs[index];
    fileInfos.path = usager.docsPath[index];

    const pathFile = path.resolve(
      configService.get("UPLOADS_FOLDER") +
        usager.structureId +
        "/" +
        usager.id +
        "/" +
        fileInfos.path
    );

    if (!fs.existsSync(pathFile + ".encrypted")) {
      if (!fs.existsSync(pathFile)) {
        throw new HttpException(
          { message: "UNENCRYPTED_FILE_NOT_FOUND" },
          HttpStatus.BAD_REQUEST
        );
      } else {
        this.encryptFile(pathFile, res);
      }
    }

    const key = configService.get("FILES_PRIVATE");
    const iv = configService.get("FILES_IV");

    const decipher = crypto.createDecipheriv("aes-256-cfb", key, iv);

    const input = fs.createReadStream(pathFile + ".encrypted");
    const output = fs.createWriteStream(pathFile + ".unencrypted");

    input
      .pipe(decipher)
      .pipe(output)
      .on("finish", () => {
        res.sendFile(output.path as string);
        this.deleteFile(pathFile + ".unencrypted");
      });
  }

  private deleteFile(pathFile: string) {
    if (fs.existsSync(pathFile)) {
      setTimeout(() => {
        try {
          fs.unlinkSync(pathFile);
        } catch (err) {
          Sentry.configureScope((scope) => {
            scope.setTag("file", pathFile);
          });

          throw new HttpException(
            { message: "CANNOT_DELETE_FILE" },
            HttpStatus.INTERNAL_SERVER_ERROR
          );
        }
      }, 2500);
    }
  }

  private encryptFile(fileName: string, @Res() res: Response) {
    const key = configService.get("FILES_PRIVATE");
    const iv = configService.get("FILES_IV");

    const cipher = crypto.createCipheriv("aes-256-cfb", key, iv);

    const input = fs.createReadStream(fileName);
    const output = fs.createWriteStream(fileName + ".encrypted");

    return input
      .pipe(cipher)
      .pipe(output)
      .on("finish", () => {
        try {
          fs.unlinkSync(fileName);
        } catch (err) {
          throw new HttpException(
            {
              message: "CANNOT_ENCRYPT_FILE",
              file: fileName,
              err,
            },
            HttpStatus.INTERNAL_SERVER_ERROR
          );
        }
        return output.path;
      });
  }
}
