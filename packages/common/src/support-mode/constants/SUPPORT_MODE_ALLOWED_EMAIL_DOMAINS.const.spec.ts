import { isSupportModeAllowedEmail } from "./SUPPORT_MODE_ALLOWED_EMAIL_DOMAINS.const";

describe("isSupportModeAllowedEmail", () => {
  it.each([
    "jean.dupont@fabrique.social.gouv.fr",
    "jean.dupont@externes.sg.social.gouv.fr",
    " Jean.Dupont@EXTERNES.SG.SOCIAL.GOUV.FR ",
  ])("allows %s", (email) => {
    expect(isSupportModeAllowedEmail(email)).toBe(true);
  });

  it.each([
    "jean.dupont@social.gouv.fr",
    "jean.dupont@sg.social.gouv.fr",
    "jean.dupont@gmail.com",
    "fabrique.social.gouv.fr@gmail.com",
    "",
    null,
    undefined,
  ])("rejects %s", (email) => {
    expect(isSupportModeAllowedEmail(email)).toBe(false);
  });
});
