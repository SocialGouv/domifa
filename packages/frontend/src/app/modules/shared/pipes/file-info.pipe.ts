import { Pipe, PipeTransform } from "@angular/core";
import { STRUCTURE_DOC_EXTENSIONS } from "@domifa/common";

// Format and size of a downloadable file, to complete its download label (RGAA 6.1):
// ".pdf, 120 Ko", or ".pdf" when the size is unknown
@Pipe({ name: "fileInfo", standalone: true })
export class FileInfoPipe implements PipeTransform {
  public transform(
    file: { filetype?: string | null; filesize?: number | null } | null
  ): string {
    if (!file) {
      return "";
    }
    const extension = file.filetype
      ? STRUCTURE_DOC_EXTENSIONS[file.filetype] ?? ""
      : "";
    const size = file.filesize ? formatFileSize(file.filesize) : "";
    return [extension, size].filter(Boolean).join(", ");
  }
}

export const formatFileSize = (bytes: number): string => {
  const kilobytes = bytes / 1024;
  if (kilobytes < 1024) {
    return `${Math.max(1, Math.round(kilobytes))} Ko`;
  }
  const megabytes = kilobytes / 1024;
  return `${new Intl.NumberFormat("fr-FR", {
    maximumFractionDigits: 1,
  }).format(megabytes)} Mo`;
};
