import { PortailUsagerPublic } from "./../../../../_common/_portail-usager/PortailUsagerPublic.type";
import { format } from "date-fns";
import { UsagerRdvInfos } from "../../../../_common";

export const getRdvInfos = (
  usager: Partial<PortailUsagerPublic>,
): UsagerRdvInfos => {
  const rdvDisplay: UsagerRdvInfos = {
    display: false,
    class: "",
    content: "",
  };

  // Aucun rendez-vous enregistré
  if (!usager || !usager?.rdv) {
    return rdvDisplay;
  }

  // Aucune date précisée
  if (!usager.rdv.dateRdv) {
    return rdvDisplay;
  }

  const dateRdv = new Date(usager.rdv.dateRdv);

  rdvDisplay.content =
    "RDV le " +
    format(dateRdv, "dd/MM/yyyy") +
    " à " +
    format(dateRdv, "HH:mm");

  // Rdv à venir
  if (dateRdv > new Date()) {
    rdvDisplay.display = true;
  }

  return rdvDisplay;
};
