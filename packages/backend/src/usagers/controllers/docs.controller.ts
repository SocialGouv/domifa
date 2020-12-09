import {
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
  UseInterceptors,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { FileInterceptor } from "@nestjs/platform-express";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Response } from "express";
import { diskStorage } from "multer";

import * as crypto from "crypto";
import * as fs from "fs";
import * as path from "path";

import { CurrentUsager } from "../../auth/current-usager.decorator";
import { CurrentUser } from "../../auth/current-user.decorator";
import { FacteurGuard } from "../../auth/guards/facteur.guard";
import { UsagerAccessGuard } from "../../auth/guards/usager-access.guard";
import { domifaConfig } from "../../config";
import { AppAuthUser } from "../../_common/model";
import { Usager } from "../interfaces/usagers";
import { DocumentsService } from "../services/documents.service";
import { UsagersService } from "../services/usagers.service";

import { deleteFile, randomName, validateUpload } from "../../util/FileManager";

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
      fileFilter: (req: any, file: Express.Multer.File, cb: any) => {
        if (!validateUpload("USAGER_DOC", req, file)) {
          throw new HttpException("INCORRECT_FORMAT", HttpStatus.BAD_REQUEST);
        }
        cb(null, true);
      },
      storage: diskStorage({
        destination: (req: any, file: Express.Multer.File, cb: any) => {
          const dir =
            domifaConfig().upload.basePath +
            req.user.structureId +
            "/" +
            req.usager.id;

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
      domifaConfig().upload.basePath +
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

    const pathFile = path.resolve(
      domifaConfig().upload.basePath +
        usager.structureId +
        "/" +
        usager.id +
        "/" +
        fileInfos.path
    );

    deleteFile(pathFile);

    deleteFile(pathFile + ".encrypted");

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
      domifaConfig().upload.basePath +
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

    const key = domifaConfig().security.files.private;
    const iv = domifaConfig().security.files.iv;

    const decipher = crypto.createDecipheriv("aes-256-cfb", key, iv);

    const input = fs.createReadStream(pathFile + ".encrypted");
    const output = fs.createWriteStream(pathFile + ".unencrypted");

    input
      .pipe(decipher)
      .pipe(output)
      .on("finish", () => {
        res.sendFile(output.path as string);
        deleteFile(pathFile + ".unencrypted");
      });
  }

  private encryptFile(fileName: string, @Res() res: Response) {
    const key = domifaConfig().security.files.private;
    const iv = domifaConfig().security.files.iv;

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
