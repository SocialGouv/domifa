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

export function validateUpload(
  event: Event,
  uploadType: "STRUCTURE_DOC" | "USAGER_DOC" | "IMPORT"
): {
  file: any;
  errors: {
    fileSize: boolean;
    fileType: boolean;
  };
} {
  const input = event.target as HTMLInputElement;

  if (!input.files?.length) {
    return;
  }

  const file = input.files[0];
  const validFileExtensions = extensionsAvailables[uploadType];

  return {
    file,
    errors: {
      fileSize: file.size < 10000000,
      fileType: validFileExtensions.includes(file.type),
    },
  };
}
