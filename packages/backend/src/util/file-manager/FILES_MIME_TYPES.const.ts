// Liste des extensions autorisé selon le contexte
export const FILES_MIME_TYPES = {
  STRUCTURE_CUSTOM_DOC: [
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ],
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
