/* eslint-disable no-useless-escape */
export const stringCleaner = { cleanString };
function cleanString(str: string): string {
  if (!str) {
    return "";
  }

  return str.replace(/[\\$~*<>{}]/gi, "").replace(/\s+/g, " ");
}
