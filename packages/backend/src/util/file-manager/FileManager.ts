import { extname } from "path";
import { ExpressRequest } from "../express";

import { randomBytes } from "crypto";
import sanitizeFilename from "sanitize-filename";
import sharp from "sharp";
import {
  SUPPORTED_FILE_EXTENSIONS,
  SUPPORTED_MIME_TYPES,
  UploadType,
  UsagerDoc,
} from "@domifa/common";

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
  uploadType: UploadType,
  _req: ExpressRequest,
  file: Express.Multer.File
): boolean {
  const validFileMimeType = SUPPORTED_MIME_TYPES[uploadType].includes(
    file.mimetype
  );

  const validFileExtension = SUPPORTED_FILE_EXTENSIONS[uploadType].includes(
    extname(file.originalname).toLowerCase()
  );

  return validFileMimeType && validFileExtension;
}

export function cleanPath(path: string): string {
  return path.replace(/[^a-z0-9]/gi, "");
}
