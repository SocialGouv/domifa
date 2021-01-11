export type Bytea = string;

// read/write binary content: https://www.postgresql.org/docs/10/datatype-binary.html
export const hexEncoder = {
  encode,
  decode,
};

const SPECIAL_CHAR = "\\x";

export function encode<T extends Object>(content: T): Bytea {
  if (content) {
    const buffer = Buffer.from(JSON.stringify(content), "utf8");
    if (buffer) {
      // hack in case of 0x00 byte in buffer: see https://github.com/typeorm/typeorm/issues/2878#issuecomment-481601106
      return SPECIAL_CHAR + buffer.toString("hex");
    }
  }
}

export function decode<T>(bytea: Bytea): T {
  if (!bytea) {
    return undefined;
  }
  if (bytea.startsWith(SPECIAL_CHAR)) {
    // NOTE: '\\x' is not present anymore when the data has been retrieved from postgres bytea column
    bytea = bytea.substr(SPECIAL_CHAR.length);
  }
  const str = Buffer.from(bytea, "hex").toString("utf8");
  return JSON.parse(str);
}
