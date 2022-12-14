export function generateSender(structureName: string): string {
  return removeAccents(structureName)
    .replace(/[^\w\s]/gi, "")
    .substring(0, 11)
    .toUpperCase();
}

function removeAccents(str: string): string {
  const accent = [
    /[\300-\306]/g,
    /[\340-\346]/g,
    /[\310-\313]/g,
    /[\350-\353]/g,
    /[\314-\317]/g,
    /[\354-\357]/g,
    /[\322-\330]/g,
    /[\362-\370]/g,
    /[\331-\334]/g,
    /[\371-\374]/g,
    /[\321]/g,
    /[\361]/g,
    /[\307]/g,
    /[\347]/g,
    "œ",
  ];
  const noaccent = [
    "A",
    "a",
    "E",
    "e",
    "I",
    "i",
    "O",
    "o",
    "U",
    "u",
    "N",
    "n",
    "C",
    "c",
    "oe",
  ];

  for (let i = 0; i < accent.length; i++) {
    str = str.replace(accent[i], noaccent[i]);
  }
  return str;
}
