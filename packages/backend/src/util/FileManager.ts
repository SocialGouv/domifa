import * as fs from "fs";
import Sentry = require("@sentry/node");
import { HttpException, HttpStatus } from "@nestjs/common";

// Liste des extensions autorisé selon le contexte
export const extensionsAvailables = {
  STRUCTURE_DOC: [
    "image/jpg",
    "image/jpeg",
    "image/png",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.oasis.opendocument.text",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-excel",
  ],
  IMPORT: [
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.oasis.opendocument.spreadsheet",
  ],
  USAGER_DOC: [
    "image/jpg",
    "image/jpeg",
    "image/bmp",
    "image/gif",
    "image/png",
    "application/pdf",
  ],
};

// Suppression effective d'un fichier
export async function deleteFile(pathFile: string) {
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

// Vérification des mimetype
export function validateUpload(
  uploadType: "STRUCTURE_DOC" | "USAGER_DOC" | "IMPORT",
  req: any,
  file: Express.Multer.File,
  cb: (error: any | null, success: boolean) => void
): void {
  const validFileExtensions = extensionsAvailables[uploadType];
  const mimeTest = validFileExtensions.includes(file.mimetype);
  // const sizeTest = file.size < 10000000;

  if (!mimeTest) {
    cb(
      {
        fileSize: true,
        fileType: mimeTest,
      },
      null
    );
  }
  cb(null, true);
}
