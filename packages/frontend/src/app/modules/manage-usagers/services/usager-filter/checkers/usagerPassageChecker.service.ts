import { UsagerLight } from "../../../../../../_common/model";
import { USAGER_DEADLINES } from "../../../constants/USAGER_DEADLINES.const";
import { UsagersFilterCriteria } from "../../../classes/UsagersFilterCriteria";

export const usagerPassageChecker = {
  check,
};

function check({
  usager,
  lastInteractionDate,
}: {
  usager: UsagerLight;
} & Pick<UsagersFilterCriteria, "lastInteractionDate">): boolean {
  if (!usager.lastInteraction?.dateInteraction) {
    return false;
  }

  if (lastInteractionDate && USAGER_DEADLINES[lastInteractionDate]) {
    const deadlineTime = USAGER_DEADLINES[lastInteractionDate].value;
    const interactionTime = new Date(usager.lastInteraction.dateInteraction);
    return interactionTime < deadlineTime;
  }

  return true;
}
