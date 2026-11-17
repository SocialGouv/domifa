import { UserStructure } from "@domifa/common";

import { USER_STRUCTURE_MOCK } from "../../../../../../_common/mocks/USER_STRUCTURE.mock";
import { mustAcknowledgeAccountRules } from "./account-rules-modal.component";

describe("mustAcknowledgeAccountRules", () => {
  const user = (partial: Partial<UserStructure>): UserStructure => ({
    ...USER_STRUCTURE_MOCK,
    ...partial,
  });

  it("asks a user who never acknowledged the rules", () => {
    expect(
      mustAcknowledgeAccountRules(user({ accountRulesAcknowledgedAt: null }))
    ).toBe(true);
  });

  it("does not ask again once acknowledged", () => {
    expect(
      mustAcknowledgeAccountRules(
        user({ accountRulesAcknowledgedAt: new Date() })
      )
    ).toBe(false);
  });

  it("never asks a support session", () => {
    expect(
      mustAcknowledgeAccountRules(
        user({ role: "support", accountRulesAcknowledgedAt: null })
      )
    ).toBe(false);
  });

  it("does nothing without user", () => {
    expect(mustAcknowledgeAccountRules(null)).toBe(false);
  });
});
