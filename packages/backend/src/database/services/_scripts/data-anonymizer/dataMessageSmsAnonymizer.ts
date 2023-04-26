import { appLogger } from "../../../../util";
import { messageSmsRepository } from "../../message-sms";
import { faker } from "@faker-js/faker";

export const dataMessageSmsAnonymizer = {
  anonymizeSms,
};

async function anonymizeSms() {
  const smsToSendToSkip = await messageSmsRepository.count({
    where: {
      status: "TO_SEND",
    },
  });

  appLogger.warn(`[dataMessageSmsAnonymizer] ${smsToSendToSkip} SMS to skip`);

  await messageSmsRepository.update(
    { status: "TO_SEND" },
    { status: "DISABLED" }
  );

  const smsPhoneNumberToAnonymizeCount = await messageSmsRepository.count({});

  appLogger.warn(
    `[dataMessageSmsAnonymizer] ${smsPhoneNumberToAnonymizeCount} SMS phone number to anonymize`
  );

  await messageSmsRepository.update(
    {},
    {
      phoneNumber: "+33606060606",
      responseId: "",
      usagerRef: faker.datatype.number(),
    }
  );
}
