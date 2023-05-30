import { email } from "./email.yup";

describe("email schema", () => {
  it("valid email", async () => {
    const validEmails = [
      "email.complexe+test@gmail.com",
      "john.doe@example.co.uk",
      "john_doe123@example.com",
      "email_123@example-domain.com",
      "email@subdomain.example.com",
      "email@maître.fr",
    ];

    for await (const mail of validEmails) {
      const result = await email().validate(mail);
      expect(result).toEqual(mail);
    }
  });

  it("invalid email", async () => {
    const invalidEmails = [
      "email_sans_domaine@",
      ".email_invalide@example.com",
      "email_invalide@.com",
      "email@domaine..com",
      "email#invalide@example.com",
      "email invalide@example.com",
      "email@exemple_com",
      "email@[127.0.0.1]",
      "email@[IPv6:2001:db8::1]",
      '"email_invalide"@exemple.com',
      "email@[ex*mple.com]",
      "email@[example].com",
      "email@[example_com]",
    ];

    for await (const mail of invalidEmails) {
      await expect(email().validate(mail)).rejects.toThrow();
    }
  });
});
