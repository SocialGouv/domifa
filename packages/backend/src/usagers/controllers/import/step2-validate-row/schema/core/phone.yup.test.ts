import { PhoneNumberFormat } from "google-libphonenumber";
import { getPhoneString } from "./../../../../../../util/phone/phoneUtils.service";
import { phone } from "./phone.yup";

describe("phone schema", () => {
  it("valid phone", async () => {
    expect(
      await phone().validate({ numero: "0602030405", countryCode: "fr" })
    ).toEqual({ countryCode: "fr", numero: "06 02 03 04 05" });

    expect(
      await phone().validate({
        numero: "06------02------03------04 05",
        countryCode: "fr",
      })
    ).toEqual({ countryCode: "fr", numero: "06 02 03 04 05" });

    const PHONES_TO_CHECK = {
      mq: "6 96---01. 02 03",
      gp: "6 91---22. 33 44",
      gf: "6 94---01. 02 03",
      re: "6 92---01. 02 03",
      yt: "6 39---01. 02 03",
      fr: "6 01---02. 02 04",
      pf: "87 01---02. 03",
      wf: "82---01. 02",
      pm: "40---01. 02",
    };
    for (const phoneNumber of Object.keys(PHONES_TO_CHECK)) {
      expect(
        await phone().validate({
          numero: PHONES_TO_CHECK[phoneNumber],
          countryCode: phoneNumber,
        })
      ).toEqual({
        countryCode: phoneNumber,
        numero: getPhoneString(
          {
            countryCode: phoneNumber,
            numero: PHONES_TO_CHECK[phoneNumber],
          },
          PhoneNumberFormat.NATIONAL
        ),
      });
    }
  });

  it("invalid phone", async () => {
    await expect(
      phone().validate({ numero: "01/02/03/04/05", countryCode: "fr" })
    ).rejects.toThrow();

    await expect(
      phone().validate({ numero: "263 10 10 10", countryCode: "re" })
    ).rejects.toThrow();
  });
});
