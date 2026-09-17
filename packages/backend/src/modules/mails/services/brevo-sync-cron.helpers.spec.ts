import {
  getEmailDeliveryIssues,
  getPreferredSenderDomains,
} from "./brevo-sync-cron.helpers";

describe("getEmailDeliveryIssues", () => {
  it("should flag blocklisted, bounced and blocked addresses, lowercased", () => {
    expect(
      getEmailDeliveryIssues({
        delivered: [],
        opened: ["bounce@mairie.fr"],
        failed: ["Bounce@Mairie.fr", "blocked@ccas.fr"],
        blocklisted: ["LIST@asso.fr"],
      })
    ).toEqual(
      new Map([
        ["list@asso.fr", "BLOCKLISTED"],
        ["bounce@mairie.fr", "BOUNCED"],
        ["blocked@ccas.fr", "BOUNCED"],
      ])
    );
  });

  it("should flag delivered addresses that never opened", () => {
    expect(
      getEmailDeliveryIssues({
        delivered: ["reads@mairie.fr", "Silent@Mairie.fr", "silent@mairie.fr"],
        opened: ["READS@mairie.fr"],
        failed: [],
        blocklisted: [],
      })
    ).toEqual(new Map([["silent@mairie.fr", "NEVER_OPENED"]]));
  });

  it("should keep the most severe reason", () => {
    expect(
      getEmailDeliveryIssues({
        delivered: ["a@mairie.fr"],
        opened: [],
        failed: ["a@mairie.fr"],
        blocklisted: ["a@mairie.fr"],
      })
    ).toEqual(new Map([["a@mairie.fr", "BLOCKLISTED"]]));
  });

  it("should not flag addresses without any event", () => {
    expect(
      getEmailDeliveryIssues({
        delivered: [],
        opened: [],
        failed: [],
        blocklisted: [],
      }).size
    ).toBe(0);
  });
});

describe("getPreferredSenderDomains", () => {
  const FABRIQUE = "contact.domifa@fabrique.social.gouv.fr";
  const DOMIFA = "ne-pas-repondre@mail.domifa.fabrique.social.gouv.fr";

  const sends = (
    recipient: string,
    from: string,
    count: number,
    openedCount: number,
    templateId = 66
  ) => {
    const delivered = Array.from({ length: count }, (_, i) => ({
      email: recipient,
      from,
      templateId,
      messageId: `${recipient}-${from}-${templateId}-${i}`,
    }));
    return {
      delivered,
      opened: delivered.slice(0, openedCount).map(({ messageId }) => ({
        messageId,
      })),
    };
  };

  const merge = (...parts: Array<ReturnType<typeof sends>>) => ({
    delivered: parts.flatMap((part) => part.delivered),
    opened: parts.flatMap((part) => part.opened),
  });

  it("should prefer mail.domifa where it opens clearly better", () => {
    const result = getPreferredSenderDomains(
      merge(
        sends("a@laposte.fr", FABRIQUE, 40, 2),
        sends("b@laposte.fr", DOMIFA, 20, 6)
      )
    );
    expect(result).toEqual(
      new Map([["laposte.fr", "mail.domifa.fabrique.social.gouv.fr"]])
    );
  });

  it("should keep the default sender when mail.domifa opens worse or barely better", () => {
    const result = getPreferredSenderDomains(
      merge(
        sends("a@croix-rouge.fr", FABRIQUE, 40, 34),
        sends("b@croix-rouge.fr", DOMIFA, 40, 8),
        sends("a@gmail.com", FABRIQUE, 100, 80),
        sends("b@gmail.com", DOMIFA, 100, 83)
      )
    );
    expect(result.size).toBe(0);
  });

  it("should keep the default sender without enough emails on both senders", () => {
    const result = getPreferredSenderDomains(
      merge(
        sends("a@petite-mairie.fr", FABRIQUE, 19, 0),
        sends("b@petite-mairie.fr", DOMIFA, 50, 50),
        sends("a@ccas.fr", FABRIQUE, 50, 0),
        sends("b@ccas.fr", DOMIFA, 19, 19)
      )
    );
    expect(result.size).toBe(0);
  });

  it("should only compare templates sent with both senders", () => {
    const result = getPreferredSenderDomains(
      merge(
        sends("a@orange.fr", FABRIQUE, 100, 50, 34),
        sends("b@orange.fr", FABRIQUE, 30, 20, 66),
        sends("c@orange.fr", DOMIFA, 30, 21, 66)
      )
    );
    expect(result.size).toBe(0);
  });

  it("should ignore unknown senders", () => {
    const result = getPreferredSenderDomains(
      merge(
        sends("a@mairie.fr", FABRIQUE, 30, 0),
        sends("b@mairie.fr", "other@elsewhere.fr", 30, 30)
      )
    );
    expect(result.size).toBe(0);
  });
});
