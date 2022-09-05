import { appLogger } from "../../../../util";
import { messageEmailRepository } from "../../message-email";
import { dataEmailAnonymizer } from "./dataEmailAnonymizer";

export const dataMessageEmailAnonymizer = {
  anonymizeEmail,
};

async function anonymizeEmail() {
  const emailPhoneNumberToAnonymizeCount = await messageEmailRepository.count(
    {}
  );

  appLogger.warn(
    `[dataMessageEmailAnonymizer] ${emailPhoneNumberToAnonymizeCount} emails to anonymize`
  );

  await messageEmailRepository.update(
    {},
    {
      sendDetails: {
        sent: [],
        skipped: [],
        serverResponse: "fake",
      },
      content: {
        from: {
          address: dataEmailAnonymizer.anonymizeEmail({
            prefix: "from",
            id: "1",
          }),
          personalName: "xxx",
        },
        html: "",
        text: "",
        subject: "",
        replyTo: {
          address: dataEmailAnonymizer.anonymizeEmail({
            prefix: "reply-to",
            id: "2",
          }),
          personalName: "xxx",
        },
        to: [
          {
            address: dataEmailAnonymizer.anonymizeEmail({
              prefix: "to",
              id: "3",
            }),
            personalName: "xxx",
          },
        ],
        icalEvent: null,
      },
    }
  );
}
