import { appLogger } from "../../../../util";
import { messageSmsRepository } from "../../message-sms";

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

  await messageSmsRepository.updateMany(
    { status: "TO_SEND" },
    { status: "DISABLED" }
  );

  const smsPhoneNumberToAnonymizeCount = await messageSmsRepository.count({});

  appLogger.warn(
    `[dataMessageSmsAnonymizer] ${smsPhoneNumberToAnonymizeCount} SMS phone number to anonymize`
  );

  await messageSmsRepository.updateMany(
    {},
    {
      phoneNumber: "0600000000",
    }
  );
}
