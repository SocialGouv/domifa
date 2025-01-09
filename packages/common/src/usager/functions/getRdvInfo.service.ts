import fr from "date-fns/locale/fr";
import { format } from "date-fns";
import { ETAPE_ENTRETIEN, type UsagerRdv, type UsagerRdvInfo } from "../..";

export const getRdvInfo = (usager?: {
  etapeDemande: number;
  rdv: UsagerRdv | null;
}): UsagerRdvInfo => {
  const rdvDisplay: UsagerRdvInfo = {
    class: "",
    content: "",
  };

  if (
    usager?.etapeDemande &&
    usager?.etapeDemande < ETAPE_ENTRETIEN &&
    usager?.rdv?.dateRdv
  ) {
    const dateRdv = new Date(usager.rdv.dateRdv);
    rdvDisplay.content = `${format(dateRdv, "dd MMMM yyyy", {
      locale: fr,
    })} à ${format(dateRdv, "HH:mm")}`;

    rdvDisplay.class = dateRdv < new Date() ? "danger" : "warning";
    return rdvDisplay;
  }

  return rdvDisplay;
};
