import { appLogger } from "../../../../util";
import { UsagerHistory } from "../../../../_common/model";
import { usagerHistoryRepository } from "../../usager/usagerHistoryRepository.service";
import { dataStructureAnonymizer } from "./dataStructureAnonymizer";
import { dataUsagerAnonymizer } from "./dataUsagerAnonymizer";

export const dataUsagerHistoryAnonymizer = {
  anonymizeUsagersHistory,
};

async function anonymizeUsagersHistory() {
  const usagersHistory = await usagerHistoryRepository.findMany(
    {},
    {
      select: [
        "uuid",
        "usagerUUID",
        "usagerRef",
        "structureId",
        "import",
        "states",
      ],
    }
  );

  const usagersHistoryToAnonymize = usagersHistory.filter((x) =>
    isUsagerToAnonymize(x)
  );

  appLogger.warn(
    `[dataUsagerHistoryAnonymizer] ${usagersHistoryToAnonymize.length}/${usagersHistory.length} usagersHistory to anonymize`
  );
  for (let i = 0; i < usagersHistoryToAnonymize.length; i++) {
    const usagerHistory = usagersHistoryToAnonymize[i];
    if (i !== 0 && i % 5000 === 0) {
      appLogger.warn(
        `[dataUsagerHistoryAnonymizer] ${i}/${usagersHistoryToAnonymize.length} usagersHistory anonymized`
      );
    }
    await _anonymizeUsagerHistory(usagerHistory);
  }
}
function isUsagerToAnonymize(x: { structureId: number }): unknown {
  return dataStructureAnonymizer.isStructureToAnonymise({ id: x.structureId });
}

async function _anonymizeUsagerHistory(usagerHistory: UsagerHistory) {
  const states = usagerHistory.states.map((s) => ({
    ...s,
    entretien: dataUsagerAnonymizer.anonymizeUsagerEntretien(s.entretien),
    decision: dataUsagerAnonymizer.anonymizeUsagerDecision(s.decision),
    ayantsDroits: dataUsagerAnonymizer.anonymizeAyantDroits(s.ayantsDroits),
  }));

  return usagerHistoryRepository.updateOne(
    { uuid: usagerHistory.uuid },
    { states }
  );
}
