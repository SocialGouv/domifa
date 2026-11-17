import { ContactSupportDto } from "./contact-support.dto";
import {
  BadRequestException,
  Body,
  Controller,
  HttpStatus,
  Post,
  Res,
  UploadedFile,
  UseInterceptors,
} from "@nestjs/common";
import { Throttle } from "@nestjs/throttler";
import { diskStorage } from "multer";

import {
  validateUpload,
  randomName,
} from "../../util/file-manager/FileManager";

import { ExpressRequest, ExpressResponse } from "../../util/express";
import { FILES_SIZE_LIMIT } from "../../util/file-manager";
import { ContactSupportTable, contactSupportRepository } from "../../database";
import { appLogger, getPhoneString } from "../../util";
import { BrevoSenderService } from "../mails/services/brevo-sender/brevo-sender.service";
import { domifaConfig } from "../../config";
import {
  CONTACT_SUPPORT_SUBJECT_LABELS,
  DEPARTEMENTS_MAP,
  MON_DOMIFA_CONTACT_SUBJECTS_DEF,
  REGIONS_LISTE,
} from "@domifa/common";
import { MonDomifaContactDto } from "./mon-domifa-contact.dto";
import { AntivirusFileInterceptor } from "../antivirus";
import { CONTACT_SUPPORT_FILE_MIME_TYPES } from "./CONTACT_SUPPORT_FILE_MIME_TYPES.const";

const ContactSupportFileInterceptor = AntivirusFileInterceptor(
  "file",
  CONTACT_SUPPORT_FILE_MIME_TYPES,
  {
    limits: FILES_SIZE_LIMIT,
    fileFilter: (
      req: ExpressRequest,
      file: Express.Multer.File,
      callback: (error: Error | null, acceptFile: boolean) => void
    ) => {
      if (!validateUpload("STRUCTURE_DOC", req, file)) {
        return callback(
          new BadRequestException({ message: "INCORRECT_FORMAT" }),
          false
        );
      }
      callback(null, true);
    },
    storage: diskStorage({
      filename: (
        _req,
        file: Express.Multer.File,
        callback: (error: Error | null, destination: string) => void
      ) => {
        return callback(null, randomName(file));
      },
    }),
  }
);

@Controller("contact")
export class ContactSupportController {
  constructor(private readonly brevoSenderService: BrevoSenderService) {}

  @Throttle({
    short: { limit: 1, ttl: 1_000, blockDuration: 60_000 }, // 1 req/sec, block 1min
    medium: { limit: 3, ttl: 60_000, blockDuration: 1_800_000 }, // 3 req/min, block 30min
  })
  @Post("")
  @UseInterceptors(ContactSupportFileInterceptor)
  public async contactSupport(
    @Body() contactSupportDto: ContactSupportDto,
    @UploadedFile() file: Express.Multer.File,
    @Res() res: ExpressResponse
  ) {
    const phone = contactSupportDto?.phone
      ? getPhoneString(contactSupportDto.phone) || null
      : null;

    // "AUTRE" carries its free-text detail in `subjectOther` (validated in
    // the DTO); every other value maps to a fixed, trusted label.
    const subjectLabel =
      contactSupportDto.subject === "AUTRE"
        ? contactSupportDto.subjectOther
        : CONTACT_SUPPORT_SUBJECT_LABELS[contactSupportDto.subject];

    const dataToSave = new ContactSupportTable({
      ...contactSupportDto,
      subject: subjectLabel,
      phone,
    });

    if (file) {
      dataToSave.attachment = {
        filename: file.filename,
        path: file.path,
      };
    }

    await contactSupportRepository.save(dataToSave);

    const subject = `[SUPPORT] ${subjectLabel} - ${contactSupportDto.structureName}`;

    const params = {
      structure: contactSupportDto?.structureId
        ? `Oui: ${contactSupportDto.structureId}`
        : "Non",
      phone: phone || "Non renseigné",
      content: contactSupportDto.content,
      email: contactSupportDto.email,
      name: contactSupportDto.name,
      subject: subjectLabel,
      structureName: contactSupportDto.structureName,
    };

    return this.sendToSupport(res, {
      endpoint: "contact",
      subject,
      params,
      replyTo: {
        email: contactSupportDto.email,
        name: contactSupportDto.name,
      },
      attachmentPath: file?.path,
    });
  }

  // Contact form of the "Mon DomiFa" portal (domiciliés). Every subject is
  // sent to the support team. Nothing is stored in database.
  @Throttle({
    short: { limit: 1, ttl: 1_000, blockDuration: 60_000 }, // 1 req/sec, block 1min
    medium: { limit: 3, ttl: 60_000, blockDuration: 1_800_000 }, // 3 req/min, block 30min
  })
  @Post("mon-domifa")
  public async contactMonDomifa(
    @Body() dto: MonDomifaContactDto,
    @Res() res: ExpressResponse
  ) {
    if (
      dto.regionCode &&
      dto.departement &&
      DEPARTEMENTS_MAP[dto.departement]?.regionCode !== dto.regionCode
    ) {
      throw new BadRequestException({ message: "INCORRECT_DEPARTEMENT" });
    }

    const subjectLabel = MON_DOMIFA_CONTACT_SUBJECTS_DEF[dto.subject].label;
    const name = `${dto.prenom} ${dto.nom}`;
    const localisation = [
      dto.departement
        ? `${dto.departement} - ${
            DEPARTEMENTS_MAP[dto.departement].departmentName
          }`
        : null,
      dto.regionCode ? REGIONS_LISTE[dto.regionCode] : null,
    ]
      .filter(Boolean)
      .join(", ");

    const params = {
      structure: "Non (domicilié - Mon DomiFa)",
      phone: getPhoneString(dto.phone) || "Non renseigné",
      content: dto.content || "Aucun message complémentaire",
      email: dto.email,
      name,
      subject: `[MON DOMIFA] ${subjectLabel}`,
      structureName: localisation
        ? `${dto.structureName} (${localisation})`
        : dto.structureName,
    };

    return this.sendToSupport(res, {
      endpoint: "contact/mon-domifa",
      subject: `[MON DOMIFA] ${subjectLabel} - ${dto.structureName}`,
      params,
      replyTo: { email: dto.email, name },
    });
  }

  // Sends a contact form to the support mailbox. User data is cleaned by
  // BrevoSenderService.sendEmailWithTemplate for every email.
  private async sendToSupport(
    res: ExpressResponse,
    {
      endpoint,
      subject,
      params,
      replyTo,
      attachmentPath,
    }: {
      endpoint: string;
      subject: string;
      params: Record<string, string>;
      replyTo: { email: string; name: string };
      attachmentPath?: string;
    }
  ) {
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
        replyTo,
        attachmentPath,
      });

      return res.status(HttpStatus.OK).json({ message: "OK" });
    } catch (error) {
      // No personal data in the log: neither the email nor the content
      appLogger.error("[CONTACT] Support email could not be sent", {
        sentry: true,
        context: {
          endpoint,
          errorMessage: error instanceof Error ? error.message : String(error),
        },
      });
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ message: "CONTACT_FORM_ERROR" });
    }
  }
}
