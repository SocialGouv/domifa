import { removeAccents } from "../../../../util";

export function generateSender(structureName: string): string {
  return removeAccents(structureName)
    .replace(/[^\w\s]/gi, "")
    .substring(0, 11)
    .toUpperCase()
    .trim();
}
