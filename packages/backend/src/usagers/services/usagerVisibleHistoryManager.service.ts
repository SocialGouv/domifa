import { Usager, UsagerDecision } from "../../_common/model";

export const usagerVisibleHistoryManager = {
  addDecisionToVisibleHistory,
};

function addDecisionToVisibleHistory({
  usager,
}: {
  usager: Pick<Usager, "decision" | "historique" | "typeDom">;
}): UsagerDecision {
  // pour l'instant c'est une copie exacte de l'objet, mais il faut faire évoluer UsagerVisibleHistoryDecision pour ne garder que l'essentiel
  const historyDecision: UsagerDecision = {
    ...usager.decision,
  };
  if (!historyDecision.typeDom) {
    historyDecision.typeDom = usager.typeDom;
  }
  usager.historique.push(historyDecision);
  return historyDecision;
}
