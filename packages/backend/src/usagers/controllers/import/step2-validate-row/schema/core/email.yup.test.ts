import { email } from "./email.yup";

describe("email schema", () => {
  it("valid email", async () => {
    expect(await email().validate("name@domain.com")).toEqual(
      "name@domain.com"
    );
    expect(await email().validate("first.last.123@sub.my-domain.com")).toEqual(
      "first.last.123@sub.my-domain.com"
    );
  });
  it("invalid email", async () => {
    await expect(email().validate("name[AT]domain.com")).rejects.toThrow();
    await expect(email().validate("name@domain@other.com")).rejects.toThrow();
  });
});
