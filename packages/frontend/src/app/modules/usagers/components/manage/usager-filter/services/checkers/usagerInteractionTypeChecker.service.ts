import { UsagerLight } from "../../../../../../../../_common/model";
import { UsagersFilterCriteria } from "../../UsagersFilterCriteria";

export const usagerInteractionTypeChecker = {
  check,
};

function check({
  usager,
  interactionType,
}: {
  usager: UsagerLight;
} & Pick<UsagersFilterCriteria, "interactionType">): boolean {
  if (interactionType) {
    if (interactionType === "courrierIn") {
      return usager.lastInteraction.enAttente === true;
    }
  }
  return true;
}
