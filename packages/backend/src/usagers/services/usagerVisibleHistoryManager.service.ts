import {
  Usager,
  UsagerDecision,
  UsagerVisibleHistoryDecision,
} from "../../_common/model";

export const usagerVisibleHistoryManager = {
  addDecisionToVisibleHistory,
  removeLastDecision,
};

function addDecisionToVisibleHistory({
  usager,
}: {
  usager: Pick<Usager, "decision" | "historique">;
}): UsagerVisibleHistoryDecision {
  // pour l'instant c'est une copie exacte de l'objet, mais il faut faire évoluer UsagerVisibleHistoryDecision pour ne garder que l'essentiel
  const historyDecision: UsagerVisibleHistoryDecision = {
    ...usager.decision,
  };
  usager.historique.push(historyDecision);
  return historyDecision;
}

function removeLastDecision({
  usager,
}: {
  usager: Pick<Usager, "decision" | "historique">;
}): {
  removedDecision: UsagerVisibleHistoryDecision;
} {
  if (usager.historique.length >= 2) {
    // remove current decision from history
    const [removedDecision] = usager.historique.splice(
      usager.historique.length - 1,
      1
    );
    // restore previous decision from history
    usager.decision = usager.historique[0] as UsagerDecision;
    return { removedDecision };
  }
}
