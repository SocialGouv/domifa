import { UsagersCountByStatus } from "..";
import { UsagerLight } from "../../../../../../_common/model";

export function calculateUsagersCountByStatus(
  usagers: UsagerLight[]
): UsagersCountByStatus {
  return usagers.reduce(
    (count, usager) => {
      // We skip "RADIE" already count by backend
      if (usager.statut !== "RADIE") {
        count[usager.statut]++;
      }
      return count;
    },
    {
      INSTRUCTION: 0,
      VALIDE: 0,
      ATTENTE_DECISION: 0,
      REFUS: 0,
      RADIE: 0,
      TOUS: 0,
    }
  );
}
