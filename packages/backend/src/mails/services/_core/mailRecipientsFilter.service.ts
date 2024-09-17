import { domifaConfig } from "../../../config";
import { MessageEmailId, MessageEmailRecipient } from "../../../database";
import { appLogger } from "../../../util";

export const mailRecipientsFilter = {
  filterRecipients,
};

function filterRecipients(
  recipients: MessageEmailRecipient[],
  {
    messageEmailId,
    logEnabled = true,
  }: {
    messageEmailId?: MessageEmailId;
    logEnabled?: boolean;
  }
): {
  toSkip: MessageEmailRecipient[];
  toSend: MessageEmailRecipient[];
  toSkipString?: string;
} {
  let toSkip: MessageEmailRecipient[] = [];
  const toSend: MessageEmailRecipient[] = [];
  if (!domifaConfig().email.emailsEnabled) {
    if (logEnabled) {
      appLogger.debug(
        `[mailRecipientsFilter] [DISABLED] Email ${messageEmailId} won't be sent (disabled by configuration)"`
      );
    }
    toSkip = toSkip.concat(recipients);
  } else if (domifaConfig().email.emailAddressRedirectAllTo) {
    if (logEnabled) {
      appLogger.debug(
        `[mailRecipientsFilter] [REDIRECT] Email ${messageEmailId} will be redirect to "${
          domifaConfig().email.emailAddressRedirectAllTo
        }"`
      );
    }
    toSend.push({
      address: domifaConfig().email.emailAddressRedirectAllTo,
      personalName: `TEST DOMIFA`,
    });
    toSkip = toSkip.concat(recipients);
  } else {
    recipients.forEach((recipient) => {
      if (isRecipientToSkip()) {
        toSkip.push(recipient);
      } else {
        toSend.push(recipient);
      }
    });
    if (toSkip.length !== 0) {
      if (logEnabled) {
        appLogger.debug(
          `[mailRecipientsFilter] [SKIP] Email ${messageEmailId} won't be sent to "${toSkip
            .map((x) => formatEmailAddressWithName(x))
            .join(", ")}"`
        );
      }
    }
  }

  const toSkipString: string = toSkip.length
    ? toSkip.map((x) => `"${x.personalName}"<${x.address}>`).join(", ")
    : undefined;

  return { toSend, toSkip, toSkipString };
}

function isRecipientToSkip() {
  return (
    !domifaConfig().email.emailsEnabled ||
    domifaConfig().email.emailAddressRedirectAllTo
  );
}

function formatEmailAddressWithName(x: MessageEmailRecipient): string {
  return `"${x.personalName}"<${x.address}>`;
}
