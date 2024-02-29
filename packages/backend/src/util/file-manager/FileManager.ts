import { ensureDir, remove } from "fs-extra";
import { extname, join } from "path";
import { appLogger } from "..";
import { domifaConfig } from "../../config";
import { ExpressRequest } from "../express";
import { FILES_MIME_TYPES } from "./FILES_MIME_TYPES.const";
import { FILES_EXTENSIONS } from "./FILES_EXTENSIONS.const";
import { randomBytes } from "crypto";
import sanitizeFilename from "sanitize-filename";
import sharp from "sharp";
import { UsagerDoc } from "../../_common/model";

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

export const compressAndResizeImage = (
  usagerDoc: Pick<
    UsagerDoc,
    "structureId" | "uuid" | "usagerRef" | "path" | "usagerUUID" | "filetype"
  >
) => {
  const format = usagerDoc.filetype === "image/png" ? "png" : "jpeg";
  return sharp()
    .resize(3800, 3800, { fit: "inside" })
    .toFormat(format, {
      quality: format === "png" ? 9 : 70,
      progressive: true,
      compressionLevel: format === "png" ? 9 : undefined,
    });
};

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

export function cleanPath(path: string): string {
  return path.replace(/[^a-z0-9]/gi, "");
}

// Les nouveaux fichiers seront stockés dans des dossiers reprenant les uuid et non les ID
export async function getUsagerFilesDir(
  structureUUID: string,
  usagerUUID: string
): Promise<string> {
  const dir = join(
    domifaConfig().upload.basePath,
    "usager-documents",
    cleanPath(structureUUID),
    cleanPath(usagerUUID)
  );
  await ensureDir(dir);
  return dir;
}
