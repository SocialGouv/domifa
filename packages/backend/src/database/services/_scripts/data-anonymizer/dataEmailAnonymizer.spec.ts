import {
  ANONYMOUS_EMAIL_DOMAIN,
  dataEmailAnonymizer,
} from "./dataEmailAnonymizer";

describe("dataEmailAnonymizer", () => {
  it("isAnonymizedEmail", () => {
    expect(
      dataEmailAnonymizer.isAnonymizedEmail(`john@${ANONYMOUS_EMAIL_DOMAIN}`)
    ).toEqual(true);
    expect(dataEmailAnonymizer.isAnonymizedEmail(`john@test.com`)).toEqual(
      false
    );
  });
});
