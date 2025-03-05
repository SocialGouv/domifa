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

import {
  validateUpload,
  randomName,
} from "../../util/file-manager/FileManager";

import { ExpressResponse } from "../../util/express";
import { FILES_SIZE_LIMIT } from "../../util/file-manager";
import { ContactSupportTable, contactSupportRepository } from "../../database";
import { contactSupportEmailSender } from "../mails/services/templates-renderers/contact-support";
import { getPhoneString } from "../../util";

@Controller("contact")
export class ContactSupportController {
  @Post("")
  @UseInterceptors(
    FileInterceptor("file", {
      limits: FILES_SIZE_LIMIT,
      fileFilter: (
        req,
        file: Express.Multer.File,
        callback: (error: Error | null, acceptFile: boolean) => void
      ) => {
        if (!file) {
          callback(null, true);
        }
        if (!validateUpload("STRUCTURE_DOC", req, file)) {
          callback(new Error("INCORRECT_FORMAT"), false);
        }

        callback(null, true);
      },
      storage: diskStorage({
        filename: (
          _req,
          file: Express.Multer.File,
          callback: (error: Error | null, destination: string) => void
        ) => {
          callback(null, randomName(file));
        },
      }),
    })
  )
  public async contactSupport(
    @Body() contactSupportDto: ContactSupportDto,
    @UploadedFile() file: Express.Multer.File,
    @Res() res: ExpressResponse
  ) {
    const phone = contactSupportDto?.phone
      ? getPhoneString(
          JSON.parse(contactSupportDto?.phone as unknown as string)
        )
      : null;

    const dataToSave = new ContactSupportTable({ ...contactSupportDto, phone });

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
