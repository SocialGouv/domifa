export const stringCleaner = { cleanString };
function cleanString(str: string) {
  if (!str) {
    return str;
  }
  return str
    .trim()
    .replace(/[&\/\\#,+()$~%.\'\":*?<>{}]/gi, "")
    .replace(/\s+/g, " ");
}
