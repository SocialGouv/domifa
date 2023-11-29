import { checkPasswordStrength } from "../IsValidPasswordDecorator";

describe("checkPasswordStrength", () => {
  it("Passwords OK", () => {
    const testPasswords = [
      "Azerty0123456!",
      "LsKVYkXBxDR3!",
      "!!!!!!V3K5nWvq84Fj",
      "  §'/(//(nvew3gKvzgKn",
      "!x$rQAzhmaW(2Fzuk",
      "!Allez les bleus2022",
      "cpXJydcMV7WjuVc7E2nDIpgHvt)LXhexqh#HvSVN8W6u&x8*LnmXVU&m@5uzfrD",
    ];
    testPasswords.forEach((valueOk: string) => {
      expect(checkPasswordStrength(valueOk)).toEqual(true);
    });
  });

  it("Passwords Fail", () => {
    const testPasswords = [
      "Azerty01234",
      "azerty01234564564",
      "LsKVYk",
      "123456879964661",
      "<<<<<<<<<<<<<<>>>>>>>>>>>>>>",
      null,
      undefined,
      "",
      "                  ",
      "AZERTYU001235",
      "cpXJydcMV7WjuVc7E2nDIpgHvt)LXhexqh#HvSVN8W6u&x8*LnmXVU&m@5uzfrDcpXJydcMV7WjuVc7E2nDIpgHvt)LXhexqh#HvSVN8W6u&x8*LnmXVU&m@5uzfrDMV7WjuVc7E2nDIpgHvt)LXhexqh#HvSVN8W6u&x8*LnmXVU&m@5uzfrDcpXJydcMV7WjuVc7E2nDIpgHvt)LXhexqh#HvSVN8W6u&x8*LnmXVU&m@5uzfrD",
    ];
    testPasswords.forEach((valueOk: string) => {
      expect(checkPasswordStrength(valueOk)).toEqual(false);
    });
  });
});
