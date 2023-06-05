export function generateSender(structureName: string): string {
  return removeAccents(structureName)
    .replace(/[^\w\s]/gi, "")
    .substring(0, 11)
    .toUpperCase();
}

function removeAccents(str: string): string {
  const accentMappings = [
    { regex: /À|Á|Â|Ã|Ä|Å/g, replacement: "A" },
    { regex: /à|á|â|ã|ä|å/g, replacement: "a" },
    { regex: /È|É|Ê|Ë/g, replacement: "E" },
    { regex: /è|é|ê|ë/g, replacement: "e" },
    { regex: /Ì|Í|Î|Ï/g, replacement: "I" },
    { regex: /ì|í|î|ï/g, replacement: "i" },
    { regex: /Ò|Ó|Ô|Õ|Ö|Ø/g, replacement: "O" },
    { regex: /ò|ó|ô|õ|ö|ø/g, replacement: "o" },
    { regex: /Ù|Ú|Û|Ü/g, replacement: "U" },
    { regex: /ù|ú|û|ü/g, replacement: "u" },
    { regex: /Ñ/g, replacement: "N" },
    { regex: /ñ/g, replacement: "n" },
    { regex: /Ç/g, replacement: "C" },
    { regex: /ç/g, replacement: "c" },
    { regex: /œ/g, replacement: "oe" },
  ];

  for (const mapping of accentMappings) {
    str = str.replace(mapping.regex, mapping.replacement);
  }

  return str;
}
