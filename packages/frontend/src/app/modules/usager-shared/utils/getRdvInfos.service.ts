import { format } from "date-fns";

import { UsagerLight, UsagerRdvInfos } from "../../../../_common/model";
import { ETAPE_ENTRETIEN } from "../../../../_common/model/usager/constants";

export const getRdvInfos = (usager: Partial<UsagerLight>): UsagerRdvInfos => {
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
  // Rdv passé
  else {
    // On Affiche ou masque selon que l'entretien est fait
    if (usager.etapeDemande < ETAPE_ENTRETIEN) {
      rdvDisplay.display = true;
      rdvDisplay.class = "text-danger";
    }
  }

  return rdvDisplay;
};
