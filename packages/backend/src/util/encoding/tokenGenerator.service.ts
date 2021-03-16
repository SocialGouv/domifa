import * as crypto from "crypto";

export const tokenGenerator = {
  generateToken,
};

function generateToken({ length }: { length: number }): string {
  return crypto.randomBytes(length).toString("hex");
}
