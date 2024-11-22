export function removeAccents(str: string): string {
  const accentMappings = [
    { regex: /[ÀÁÂÃÄÅ]/g, replacement: "A" },
    { regex: /[àáâãäå]/g, replacement: "a" },
    { regex: /[ÈÉÊË]/g, replacement: "E" },
    { regex: /[èéêë]/g, replacement: "e" },
    { regex: /[ÌÍÎÏ]/g, replacement: "I" },
    { regex: /[ìíîï]/g, replacement: "i" },
    { regex: /[ÒÓÔÕÖØ]/g, replacement: "O" },
    { regex: /[òóôõöø]/g, replacement: "o" },
    { regex: /[ÙÚÛÜ]/g, replacement: "U" },
    { regex: /[ùúûü]/g, replacement: "u" },
    { regex: /Ñ/g, replacement: "N" },
    { regex: /ñ/g, replacement: "n" },
    { regex: /Ç/g, replacement: "C" },
    { regex: /ç/g, replacement: "c" },
    { regex: /œ/g, replacement: "oe" },
    { regex: /Ð/g, replacement: "D" },
    { regex: /ð/g, replacement: "d" },
    { regex: /î/g, replacement: "i" },
    { regex: /Î/g, replacement: "I" },
  ];
  for (const mapping of accentMappings) {
    str = str.replace(mapping.regex, mapping.replacement);
  }
  return str;
}
