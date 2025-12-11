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
import { getPhoneString } from "../../util";
import { BrevoSenderService } from "../mails/services/brevo-sender/brevo-sender.service";
import { domifaConfig } from "../../config";

@Controller("contact")
export class ContactSupportController {
  constructor(private readonly brevoSenderService: BrevoSenderService) {}

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

    await contactSupportRepository.save(dataToSave);

    const subject = `[SUPPORT] ${contactSupportDto.subject} - ${contactSupportDto.structureName}`;

    const params = {
      structure: contactSupportDto?.structureId
        ? `Oui: ${contactSupportDto.structureId}`
        : "Non",
      phone: contactSupportDto?.phone
        ? getPhoneString(contactSupportDto?.phone)
        : "Non renseigné",
      content: contactSupportDto.content,
      email: contactSupportDto.email,
      name: contactSupportDto.name,
      subject: contactSupportDto.subject,
      structureName: contactSupportDto.structureName,
    };

    try {
      await this.brevoSenderService.sendEmailWithTemplate({
        templateId: domifaConfig().brevo.templates.contactSupport,
        subject,
        params,
        to: [
          {
            email: domifaConfig().email.emailAddressAdmin,
            name: "DomiFa",
          },
        ],
        attachmentPath: file?.path,
      });

      return res.status(HttpStatus.OK).json({ message: "OK" });
    } catch (error) {
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ message: "CONTACT_FORM_ERROR" });
    }
  }
}
