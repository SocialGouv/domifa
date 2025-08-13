import { UsagersCountByStatus } from "@domifa/common";
import { UsagerLight } from "../../../../../_common/model";

export function calculateUsagersCountByStatus(
  usagers: UsagerLight[],
  usagersRadiesTotalCount: number
): UsagersCountByStatus {
  const counters = usagers.reduce(
    (count, usager) => {
      // We skip "RADIE" already count by backend
      if (usager.statut !== "RADIE") {
        count[usager.statut]++;
        count.TOUS++;
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
  counters.TOUS = counters.TOUS + usagersRadiesTotalCount;
  counters.RADIE = usagersRadiesTotalCount;
  return counters;
}
