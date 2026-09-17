import {
  BrevoSenderDomain,
  DEFAULT_BREVO_SENDER_DOMAIN,
  isBrevoSenderDomain,
} from "./brevo-sender/brevo-senders.const";

export type EmailDeliveryIssueReason =
  | "BLOCKLISTED"
  | "BOUNCED"
  | "NEVER_OPENED";

// An address is in delivery issue when, over the fetched window, it is in the
// Brevo blocklist, bounced or was blocked, or received emails without ever
// opening one. The first matching reason wins, in that order.
export function getEmailDeliveryIssues({
  delivered,
  opened,
  failed,
  blocklisted,
}: {
  delivered: string[];
  opened: string[];
  failed: string[];
  blocklisted: string[];
}): Map<string, EmailDeliveryIssueReason> {
  const issues = new Map<string, EmailDeliveryIssueReason>();
  const add = (emails: string[], reason: EmailDeliveryIssueReason) => {
    for (const email of emails) {
      if (!issues.has(email.toLowerCase())) {
        issues.set(email.toLowerCase(), reason);
      }
    }
  };

  const openedEmails = new Set(opened.map((email) => email.toLowerCase()));

  add(blocklisted, "BLOCKLISTED");
  add(failed, "BOUNCED");
  add(
    delivered.filter((email) => !openedEmails.has(email.toLowerCase())),
    "NEVER_OPENED"
  );

  return issues;
}

// Minimum delivered emails per sender on a recipient domain before comparing,
// and open rate lead required to move away from the default sender.
export const PREFERRED_SENDER_MIN_DELIVERED = 20;
export const PREFERRED_SENDER_MIN_LEAD = 0.05;

// Returns the recipient domains where another sender opens better than the
// default one. Domains missing from the map stay on the default sender. Only
// templates sent with several senders are compared, so that a sender is not
// favoured by the kind of emails it sent.
export function getPreferredSenderDomains({
  delivered,
  opened,
}: {
  delivered: Array<{
    email: string;
    messageId: string;
    from?: string;
    templateId?: number;
  }>;
  opened: Array<{ messageId: string }>;
}): Map<string, BrevoSenderDomain> {
  const openedMessages = new Set(opened.map((event) => event.messageId));
  const sendersByTemplate = new Map<number, Set<string>>();
  for (const event of delivered) {
    const sender = event.from?.split("@")[1]?.toLowerCase();
    if (event.templateId && isBrevoSenderDomain(sender)) {
      const senders = sendersByTemplate.get(event.templateId) ?? new Set();
      senders.add(sender);
      sendersByTemplate.set(event.templateId, senders);
    }
  }
  const stats = new Map<
    string,
    Map<BrevoSenderDomain, { delivered: Set<string>; opened: Set<string> }>
  >();

  for (const event of delivered) {
    const sender = event.from?.split("@")[1]?.toLowerCase();
    const recipientDomain = event.email.split("@")[1]?.toLowerCase();
    if (
      !isBrevoSenderDomain(sender) ||
      !recipientDomain ||
      !event.templateId ||
      (sendersByTemplate.get(event.templateId)?.size ?? 0) < 2
    ) {
      continue;
    }
    const bySender = stats.get(recipientDomain) ?? new Map();
    const counters = bySender.get(sender) ?? {
      delivered: new Set<string>(),
      opened: new Set<string>(),
    };
    counters.delivered.add(event.messageId);
    if (openedMessages.has(event.messageId)) {
      counters.opened.add(event.messageId);
    }
    bySender.set(sender, counters);
    stats.set(recipientDomain, bySender);
  }

  const preferred = new Map<string, BrevoSenderDomain>();
  for (const [recipientDomain, bySender] of stats) {
    const rateOf = (sender: BrevoSenderDomain): number | null => {
      const counters = bySender.get(sender);
      return counters &&
        counters.delivered.size >= PREFERRED_SENDER_MIN_DELIVERED
        ? counters.opened.size / counters.delivered.size
        : null;
    };
    const defaultRate = rateOf(DEFAULT_BREVO_SENDER_DOMAIN);
    if (defaultRate === null) {
      continue;
    }

    let best: { sender: BrevoSenderDomain; rate: number } | null = null;
    for (const sender of bySender.keys()) {
      const rate = rateOf(sender);
      if (
        sender !== DEFAULT_BREVO_SENDER_DOMAIN &&
        rate !== null &&
        rate >= defaultRate + PREFERRED_SENDER_MIN_LEAD &&
        (!best || rate > best.rate)
      ) {
        best = { sender, rate };
      }
    }
    if (best) {
      preferred.set(recipientDomain, best.sender);
    }
  }

  return preferred;
}
