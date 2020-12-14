import * as fs from "fs";
import * as path from "path";
import Sentry = require("@sentry/node");
import { HttpException, HttpStatus } from "@nestjs/common";

// Liste des extensions autorisé selon le contexte
export const mimeTypes = {
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
  USAGER_DOC: ["image/jpg", "image/jpeg", "image/png", "application/pdf"],
};

export const extensions = {
  STRUCTURE_DOC: [
    ".jpg",
    ".jpeg",
    ".png",
    ".pdf",
    ".odt",
    ".doc",
    ".docx",
    ".xls",
    ".xlsx",
    ".ots",
    ".ods",
  ],
  IMPORT: [".xls", ".xlsx", ".ots", ".ods"],
  USAGER_DOC: [".jpg", ".jpeg", ".png", ".pdf"],
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

export function randomName(file: Express.Multer.File): string {
  const name = Array(32)
    .fill(null)
    .map(() => Math.round(Math.random() * 16).toString(16))
    .join("");
  return name + path.extname(file.originalname);
}

// Vérification des mimetype
export function validateUpload(
  uploadType: "STRUCTURE_DOC" | "USAGER_DOC" | "IMPORT",
  req: any,
  file: Express.Multer.File
): boolean {
  const validFileMimeType = mimeTypes[uploadType].includes(file.mimetype);
  const validFileExtension = extensions[uploadType].includes(
    path.extname(file.originalname).toLowerCase()
  );

  return validFileMimeType && validFileExtension;
}
