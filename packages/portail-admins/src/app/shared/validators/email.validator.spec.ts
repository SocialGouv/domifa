/* eslint-disable @typescript-eslint/no-explicit-any */
import { EmailValidator } from "./email.validator";

describe("EmailValidator", () => {
  it("should return null for an empty or undefined control value", () => {
    const control: any = { value: "" };
    expect(EmailValidator(control)).toBeNull();

    control.value = undefined;
    expect(EmailValidator(control)).toBeNull();
  });

  it("should return null for valid emails", () => {
    const emailsOk = [
      "simple.email@example.com",
      "admin@example.org",
      "78@pole-emploi.fr",
      "firstname-lastname@example.com",
      "115.gironde@gmail.com",
      "0626281379@orange.fr",
      "firstname+tag+sorting@example.com",
      "2014asea@strasbourg.com",
    ];
    emailsOk.forEach((email: string) => {
      const control: any = { value: email };
      expect(EmailValidator(control)).toEqual(null);
    });
  });

  it("should return an error object for invalid emails", () => {
    const emailsNotOk = [
      " @ ",
      "plainaddress",
      "@missingusername.com",
      "username@.com",
      "username@.com.",
      ".username@example.com",
      "username@-example.com",
      "username@example..com",
      "Abc..123@example.com",
      "username@example.c",
      "username@10.10.10.256",
    ];
    emailsNotOk.forEach((email: string) => {
      const control: any = { value: email };
      expect(EmailValidator(control)).toEqual({ invalidEmail: true });
    });
  });
});
