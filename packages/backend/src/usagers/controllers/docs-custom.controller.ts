import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Post,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Response } from "express";

import { CurrentUsager } from "../../auth/current-usager.decorator";
import * as fs from "fs";
import * as path from "path";
import { FacteurGuard } from "../../auth/guards/facteur.guard";
import { UsagerAccessGuard } from "../../auth/guards/usager-access.guard";

import { Usager } from "../interfaces/usagers";

import { UsagersService } from "../services/usagers.service";

import { AppAuthUser, AppUser } from "../../_common/model";
import { CurrentUser } from "../../auth/current-user.decorator";

import * as PizZip from "pizzip";
import moment = require("moment");
import { FileInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { domifaConfig } from "../../config";

// tslint:disable-next-line: no-var-requires
const Docxtemplater = require("docxtemplater");
// tslint:disable-next-line: no-var-requires
const InspectModule = require("docxtemplater/js/inspect-module");

@UseGuards(AuthGuard("jwt"), FacteurGuard)
@ApiTags("docs-custom")
@ApiBearerAuth()
@Controller("docs-custom")
export class DocsCustomController {
  constructor(private readonly usagersService: UsagersService) {}

  @ApiOperation({ summary: "Upload de documents personnalisables" })
  @Post(":id")
  @UseInterceptors(
    FileInterceptor("file", {
      fileFilter: (req: any, file: any, cb: any) => {
        const mimeTest = !file.mimetype.match(/\/(docx)$/);
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
            domifaConfig().upload.basePath + req.user.structureId + "/docs";

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
      domifaConfig().upload.basePath +
      user.structureId +
      "/" +
      usagerId +
      "/" +
      file.filename;

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

  // TODO: Upload des documents
  @Get(":id")
  @UseGuards(AuthGuard("jwt"), UsagerAccessGuard, FacteurGuard)
  public async getDocument(
    @Param("id") usagerId: number,
    @Res() res: Response,
    @CurrentUsager() usager: Usager,
    @CurrentUser() user: AppUser
  ) {
    const content = fs.readFileSync(
      path.resolve(__dirname, "../../ressources/attestation_custom.docx"),
      "binary"
    );

    const iModule = InspectModule();

    const zip = new PizZip(content);
    let doc: any;

    try {
      doc = new Docxtemplater(zip, { modules: [iModule] });
    } catch (error) {
      this.errorHandler(error);
    }

    // TODO: vérifier l'intégrité des tags d'un doc
    // const tags = iModule.getAllTags();
    // console.log(tags);

    doc.setData({
      // GENERAL
      DATE_JOUR: moment(new Date()).locale("fr").format("LL"),

      // Responsable
      NOM_RESPONSABLE: this.convertString(user.structure.responsable.nom),
      PRENOM_RESPONSABLE: this.convertString(user.structure.responsable.prenom),
      FONCTION_RESPONSABLE: this.convertString(
        user.structure.responsable.fonction
      ),

      // Structure
      NOM_STRUCTURE: this.convertString(user.structure.nom),
      TYPE_STRUCTURE: user.structure.structureType,
      ADRESSE_STRUCTURE: this.convertString(user.structure.adresse),
      COMPLEMENT_ADRESSE_STRUCTURE: this.convertString(
        user.structure.complementAdresse
      ),
      VILLE_STRUCTURE: this.convertString(user.structure.ville),
      CODE_POSTAL_STRUCTURE: this.convertString(user.structure.codePostal),

      // USAGER
      CIVILITE: usager.sexe === "femme" ? "madame" : "monsieur",
      NOM_USAGER: this.convertString(usager.prenom),
      PRENOM_USAGER: this.convertString(usager.nom),
    });

    try {
      doc.render();
    } catch (error) {
      this.errorHandler(error);
    }

    res.end(doc.getZip().generate({ type: "nodebuffer" }));
  }

  private convertString(value: any) {
    return value === undefined || value === null
      ? ""
      : value.toString().toUpperCase();
  }

  private replaceErrors(key: string, value: any) {
    if (value instanceof Error) {
      return Object.getOwnPropertyNames(value).reduce((error, errorKey) => {
        error[errorKey] = value[errorKey];
        return error;
      }, {});
    }
    return value;
  }

  private errorHandler(error: any) {
    // console.log(JSON.stringify({ error }, this.replaceErrors));

    if (error.properties && error.properties.errors instanceof Array) {
      const errorMessages = error.properties.errors
        .map((propError: any) => {
          return propError.properties.explanation;
        })
        .join("\n");

      // console.log("errorMessages", errorMessages);
      // errorMessages is a humanly readable message looking like this :
      // 'The tag beginning with "foobar" is unopened'
    }
    throw error;
  }
}
