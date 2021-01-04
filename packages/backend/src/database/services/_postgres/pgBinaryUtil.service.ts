export type Bytea = string;

// read/write binary content: https://www.postgresql.org/docs/10/datatype-binary.html
export const pgBinaryUtil = {
  write,
  read,
};

export function write(content: any): Bytea {
  const buffer = content ? Buffer.from(JSON.stringify(content)) : undefined;
  if (buffer) {
    // hack in case of 0x00 byte in buffer: see https://github.com/typeorm/typeorm/issues/2878#issuecomment-481601106
    return "\\x" + buffer.toString("hex");
  }
}

export function read<T>(bytea: Bytea): T {
  if (!bytea) {
    return undefined;
  }
  const buffer = Buffer.from(bytea, "hex");
  return JSON.parse(buffer.toString());
}
