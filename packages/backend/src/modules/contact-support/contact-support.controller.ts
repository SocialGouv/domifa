import { ContactSupportDto } from "./contact.dto";
import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Post,
  Res,
  UploadedFile,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import * as fs from "fs";

import path = require("path");
import { domifaConfig } from "../../config";
import { validateUpload, randomName } from "../../util/FileManager";
import { ContactSupportService } from "./contact-support.service";
import { contactSupportEmailSender } from "../../mails/services/templates-renderers/contact-support";
import { ExpressResponse } from "../../util/express";

@Controller("contact")
export class ContactSupportController {
  constructor(private contactSupportService: ContactSupportService) {}
  @Post("")
  @UseInterceptors(
    FileInterceptor("file", {
      fileFilter: (req: any, file: Express.Multer.File, cb: any) => {
        if (!file) {
          cb(null, true);
        }
        if (!validateUpload("USAGER_DOC", req, file)) {
          throw new HttpException("INCORRECT_FORMAT", HttpStatus.BAD_REQUEST);
        }
        return cb(null, true);
      },
      storage: diskStorage({
        destination: (req: any, file: Express.Multer.File, cb: any) => {
          const dir = path.join(
            domifaConfig().upload.basePath,
            "contact-support"
          );
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
  public async contactSupport(
    @Body() contactSupportDto: ContactSupportDto,
    @UploadedFile() file: Express.Multer.File,
    @Res() res: ExpressResponse
  ) {
    contactSupportDto.status = "ON_HOLD";
    contactSupportDto.file = file ? file.filename : null;
    const contactSaved = await this.contactSupportService.create(
      contactSupportDto
    );

    return contactSupportEmailSender.sendMail(contactSaved).then(
      () => {
        return res.status(HttpStatus.OK).json("OK");
      },
      () => {
        return res
          .status(HttpStatus.INTERNAL_SERVER_ERROR)
          .json({ message: "CONTACT_FORM_ERROR" });
      }
    );
  }
}
