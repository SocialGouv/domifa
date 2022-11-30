import * as crypto from "crypto";

export const tokenGenerator = {
  generateToken,
  generateString,
};

function generateToken({ length }: { length: number }): string {
  return crypto.randomBytes(length).toString("hex");
}

function generateString({
  length,
  charsToInclude,
  charsToExclude = "",
}: {
  length: number;
  charsToInclude?: string;
  charsToExclude?: string;
}): string {
  let isValid = false;
  let str = "";
  let i = 0;

  while (!isValid) {
    if (charsToInclude) {
      // eslint-disable-next-line prefer-spread
      str = Array.apply(null, Array(length))
        .map(() => {
          const start = crypto.randomInt(charsToInclude.length);
          return charsToInclude.substring(start, start + 1); // pick random from include list
        })
        .join("");
    } else {
      // generate, then check exclusions
      str = crypto.randomBytes(length).toString("base64").slice(0, length);
    }

    isValid = true;
    if (charsToExclude?.length) {
      for (const c of charsToExclude) {
        if (str.includes(c)) {
          isValid = false;
          break;
        }
      }
    }
    i++;
    if (i > 1000) {
      throw new Error("tokenGenerator: too much recursion");
    }
  }
  return str;
}
