import { appLogger } from "../../../../util";
import { UsagerHistory } from "../../../../_common/model";
import { usagerHistoryRepository } from "../../usager/usagerHistoryRepository.service";
import { dataStructureAnonymizer } from "./dataStructureAnonymizer";
import { UsagerDecision } from "@domifa/common";
import { getDecisionForStats } from "../../../../usagers/services";

export const dataUsagerHistoryAnonymizer = {
  anonymizeUsagersHistory,
};

async function anonymizeUsagersHistory() {
  const usagersHistory = await usagerHistoryRepository.find({
    where: {},
    select: [
      "uuid",
      "usagerUUID",
      "usagerRef",
      "structureId",
      "import",
      "states",
    ],
  });

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
    decision: getDecisionForStats(s.decision as UsagerDecision),
    ayantsDroits: s.ayantsDroits,
    entretien: {
      ...s.entretien,
      commentaires: null,
      revenusDetail: null,
      orientationDetail: null,
      liencommuneDetail: null,
      residenceDetail: null,
      causeDetail: null,
      raisonDetail: null,
      accompagnementDetail: null,
    },
  }));

  return usagerHistoryRepository.update(
    { uuid: usagerHistory.uuid },
    { states }
  );
}
