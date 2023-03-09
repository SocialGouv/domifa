import { remove } from "fs-extra";
import { extname, join } from "path";
import { appLogger } from "..";
import { domifaConfig } from "../../config";
import { ExpressRequest } from "../express";
import { FILES_MIME_TYPES } from "./FILES_MIME_TYPES.const";
import { FILES_EXTENSIONS } from "./FILES_EXTENSIONS.const";
import { randomBytes } from "crypto";
import sanitizeFilename from "sanitize-filename";

// Suppression effective d'un fichier
export async function deleteFile(pathFile: string): Promise<void> {
  try {
    await remove(pathFile);
  } catch (error) {
    appLogger.error("[FILES] Delete file fail - " + pathFile, {
      sentry: true,
      error,
    });
  }
}

export function randomName(file: Express.Multer.File): string {
  const randomValue = randomBytes(16).toString("hex");
  const sanitizedOriginalName = sanitizeFilename(file.originalname);
  const extension = extname(sanitizedOriginalName);
  return randomValue + extension;
}

// Vérification des mimetype
export function validateUpload(
  uploadType:
    | "STRUCTURE_CUSTOM_DOC"
    | "STRUCTURE_DOC"
    | "USAGER_DOC"
    | "IMPORT",
  _req: ExpressRequest,
  file: Express.Multer.File
): boolean {
  const validFileMimeType = FILES_MIME_TYPES[uploadType].includes(
    file.mimetype
  );
  const validFileExtension = FILES_EXTENSIONS[uploadType].includes(
    extname(file.originalname).toLowerCase()
  );

  return validFileMimeType && validFileExtension;
}

export function getFileDir(structureId: number, usagerRef: number): string {
  return join(
    domifaConfig().upload.basePath,
    cleanPath(`${structureId}`),
    cleanPath(`${usagerRef}`)
  );
}

export function getFilePath(
  structureId: number,
  usagerRef: number,
  fileName: string
): string {
  const dir = getFileDir(structureId, usagerRef);
  return join(dir, fileName);
}

export function cleanPath(path: string): string {
  return path.replace(/[^a-z0-9]/gi, "");
}
