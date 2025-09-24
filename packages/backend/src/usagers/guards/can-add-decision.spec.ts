import { UserStructureRole, UsagerDecisionStatut } from "@domifa/common";
import { canAddDecision } from "./can-add-decision";

interface TestCase {
  role: UserStructureRole;
  decisionStatut: UsagerDecisionStatut;
  expectedAccess: boolean;
}

describe("canAddDecision", () => {
  const testCases: TestCase[] = [
    { role: "facteur", decisionStatut: "INSTRUCTION", expectedAccess: false },
    {
      role: "facteur",
      decisionStatut: "ATTENTE_DECISION",
      expectedAccess: false,
    },
    { role: "facteur", decisionStatut: "RADIE", expectedAccess: false },
    { role: "facteur", decisionStatut: "VALIDE", expectedAccess: false },
    { role: "facteur", decisionStatut: "REFUS", expectedAccess: false },

    { role: "agent", decisionStatut: "INSTRUCTION", expectedAccess: false },
    {
      role: "agent",
      decisionStatut: "ATTENTE_DECISION",
      expectedAccess: false,
    },
    { role: "agent", decisionStatut: "RADIE", expectedAccess: false },
    { role: "agent", decisionStatut: "VALIDE", expectedAccess: false },
    { role: "agent", decisionStatut: "REFUS", expectedAccess: false },

    { role: "simple", decisionStatut: "INSTRUCTION", expectedAccess: true },
    {
      role: "simple",
      decisionStatut: "ATTENTE_DECISION",
      expectedAccess: true,
    },
    { role: "simple", decisionStatut: "RADIE", expectedAccess: true },
    { role: "simple", decisionStatut: "VALIDE", expectedAccess: false },
    { role: "simple", decisionStatut: "REFUS", expectedAccess: false },

    {
      role: "responsable",
      decisionStatut: "INSTRUCTION",
      expectedAccess: true,
    },
    {
      role: "responsable",
      decisionStatut: "ATTENTE_DECISION",
      expectedAccess: true,
    },
    { role: "responsable", decisionStatut: "RADIE", expectedAccess: true },
    { role: "responsable", decisionStatut: "VALIDE", expectedAccess: true },
    { role: "responsable", decisionStatut: "REFUS", expectedAccess: true },

    { role: "admin", decisionStatut: "INSTRUCTION", expectedAccess: true },
    { role: "admin", decisionStatut: "ATTENTE_DECISION", expectedAccess: true },
    { role: "admin", decisionStatut: "RADIE", expectedAccess: true },
    { role: "admin", decisionStatut: "VALIDE", expectedAccess: true },
    { role: "admin", decisionStatut: "REFUS", expectedAccess: true },
  ];

  test.each(testCases)(
    'Rôle "$role" avec statut "$decisionStatut" doit retourner $expectedAccess',
    ({ role, decisionStatut, expectedAccess }) => {
      expect(canAddDecision(role, decisionStatut)).toBe(expectedAccess);
    }
  );

  it("retourne false pour un statut inexistant", () => {
    expect(
      canAddDecision("admin", "STATUT_INEXISTANT" as UsagerDecisionStatut)
    ).toBe(false);
  });
});
