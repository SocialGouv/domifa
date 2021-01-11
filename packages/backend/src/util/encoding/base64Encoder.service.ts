export const base64Encoder = { encode, decode };

/* btoa */
function encode(text: string): string {
  if (Buffer.byteLength(text) !== text.length)
    throw new Error("Invalid string");
  return Buffer.from(text, "binary").toString("base64");
}

/* atob */
function decode(base64: string): string {
  return Buffer.from(base64, "base64").toString(`binary`);
}
