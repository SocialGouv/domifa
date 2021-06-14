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
  usager: Pick<Usager, "decision" | "historique" | "typeDom">;
}): UsagerVisibleHistoryDecision {
  // pour l'instant c'est une copie exacte de l'objet, mais il faut faire évoluer UsagerVisibleHistoryDecision pour ne garder que l'essentiel
  const historyDecision: UsagerVisibleHistoryDecision = {
    ...usager.decision,
  };
  if (!historyDecision.typeDom) {
    historyDecision.typeDom = usager.typeDom;
  }
  usager.historique.push(historyDecision);
  return historyDecision;
}

function removeLastDecision({
  usager,
}: {
  usager: Pick<Usager, "decision" | "historique">;
}): {
  removedDecision: UsagerVisibleHistoryDecision;
  decisionToRollback: UsagerVisibleHistoryDecision;
  historiqueToRollback: UsagerVisibleHistoryDecision[];
} {
  if (usager.historique.length >= 2) {
    // remove current decision from history
    const [decisionToRollback] = usager.historique.splice(
      usager.historique.length - 1,
      1
    );

    const historiqueToRollback = usager.historique;

    const removedDecision = usager.decision as UsagerDecision;
    // restore previous decision from history

    return {
      removedDecision,
      decisionToRollback,
      historiqueToRollback,
    };
  }
  return {
    removedDecision: undefined,
    decisionToRollback: undefined,
    historiqueToRollback: undefined,
  };
}
