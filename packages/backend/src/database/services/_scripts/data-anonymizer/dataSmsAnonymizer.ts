import { appLogger } from "../../../../util";
import { messageSmsRepository } from "../../message-sms";

export const dataSmsAnonymizer = {
  anonymizeSms,
};

async function anonymizeSms() {
  const smsToSendToAnonymize = await messageSmsRepository.count({
    where: {
      status: "TO_SEND",
    },
  });

  const smsPhoneNumberToAnonymize = await messageSmsRepository.count({});

  appLogger.warn(
    `[dataSmsAnonymizer] ${smsToSendToAnonymize} SMS TO SENDto anonymize`
  );

  await messageSmsRepository.updateMany(
    { status: "TO_SEND" },
    {
      status: "SENT_AND_RECEIVED",
    }
  );

  appLogger.warn(
    `[dataSmsAnonymizer] ${smsPhoneNumberToAnonymize} SMS phone number to anonymize`
  );

  await messageSmsRepository.updateMany(
    {},
    {
      phoneNumber: "0600000000",
    }
  );
}
