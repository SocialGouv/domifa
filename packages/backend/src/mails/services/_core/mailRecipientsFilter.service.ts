import { domifaConfig } from "../../../config";
import {
  dataEmailAnonymizer,
  MessageEmailId,
  MessageEmailRecipient,
} from "../../../database";
import { appLogger } from "../../../util";

export const mailRecipientsFilter = {
  filterRecipients,
};

function filterRecipients(
  recipients: MessageEmailRecipient[],
  {
    messageEmailId,
  }: {
    messageEmailId: MessageEmailId;
  }
): {
  toSkip: MessageEmailRecipient[];
  toSend: MessageEmailRecipient[];
} {
  let toSkip: MessageEmailRecipient[] = [];
  const toSend: MessageEmailRecipient[] = [];
  if (!domifaConfig().email.emailsEnabled) {
    appLogger.debug(
      `[mailRecipientsFilter] [DISABLED] Email ${messageEmailId} won't be sent (disabled by configuration)"`
    );
    toSkip = toSkip.concat(recipients);
  } else if (domifaConfig().email.emailAddressRedirectAllTo) {
    appLogger.debug(
      `[mailRecipientsFilter] [REDIRECT] Email ${messageEmailId} will be redirect to "${
        domifaConfig().email.emailAddressRedirectAllTo
      }"`
    );
    toSend.push({
      address: domifaConfig().email.emailAddressRedirectAllTo,
      personalName: `TEST DOMIFA`,
    });
    toSkip = toSkip.concat(recipients);
  } else {
    recipients.forEach((recipient) => {
      if (isRecipientToSkip(recipient)) {
        toSkip.push(recipient);
      } else {
        toSend.push(recipient);
      }
    });
    if (toSkip.length !== 0) {
      appLogger.debug(
        `[mailRecipientsFilter] [SKIP] Email ${messageEmailId} won't be sent to "${toSkip
          .map((x) => formatEmailAddressWithName(x))
          .join(", ")}"`
      );
    }
  }

  return { toSend, toSkip };
}

function isRecipientToSkip(recipient: MessageEmailRecipient) {
  return (
    !domifaConfig().email.emailsEnabled ||
    dataEmailAnonymizer.isAnonymizedEmail(recipient.address) ||
    domifaConfig().email.emailAddressRedirectAllTo
  );
}

function formatEmailAddressWithName(x: MessageEmailRecipient): string {
  return `"${x.personalName}"<${x.address}>`;
}
