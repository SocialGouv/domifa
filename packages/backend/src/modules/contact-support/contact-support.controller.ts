import { ContactSupportTable } from "./../../database/entities/contact-support/ContactSupportTable.typeorm";
import { contactSupportRepository } from "./../../database/services/contact/contactSupportRepository.service";
import { ContactSupportDto } from "./contact-support.dto";
import {
  Body,
  Controller,
  HttpStatus,
  Post,
  Res,
  UploadedFile,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";

import { domifaConfig } from "../../config";
import { validateUpload, randomName } from "../../util/FileManager";

import { contactSupportEmailSender } from "../../mails/services/templates-renderers/contact-support";
import { ExpressRequest, ExpressResponse } from "../../util/express";
import { ensureDir } from "fs-extra";
import { join } from "path";

@Controller("contact")
export class ContactSupportController {
  @Post("")
  @UseInterceptors(
    FileInterceptor("file", {
      fileFilter: (req: ExpressRequest, file: Express.Multer.File, cb: any) => {
        if (!file) {
          cb(null, true);
        }
        if (!validateUpload("STRUCTURE_DOC", req, file)) {
          return cb("INCORRECT_FORMAT", false);
        }
        return cb(null, true);
      },
      storage: diskStorage({
        destination: async (
          _req: ExpressRequest,
          _file: Express.Multer.File,
          cb: any
        ) => {
          const dir = join(domifaConfig().upload.basePath, "contact-support");
          await ensureDir(dir);
          cb(null, dir);
        },
        filename: (
          _req: ExpressRequest,
          file: Express.Multer.File,
          cb: any
        ) => {
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
    const dataToSave = new ContactSupportTable(contactSupportDto);

    if (file) {
      dataToSave.attachment = {
        filename: file.filename,
        path: file.path,
      };
    }

    const contactSaved = await contactSupportRepository.save(dataToSave);

    try {
      await contactSupportEmailSender.sendMail(contactSaved);
      return res.status(HttpStatus.OK).json({ message: "OK" });
    } catch (error) {
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ message: "CONTACT_FORM_ERROR" });
    }
  }
}
