import fr from "date-fns/locale/fr";
import { format } from "date-fns";
import { ETAPE_ENTRETIEN, type UsagerRdv, type UsagerRdvInfos } from "../..";

export const getRdvInfos = (usager?: {
  etapeDemande: number;
  rdv: UsagerRdv | null;
}): UsagerRdvInfos => {
  const rdvDisplay: UsagerRdvInfos = {
    display: false,
    class: "",
    content: "",
  };

  if (!usager?.rdv?.dateRdv) {
    return rdvDisplay;
  }

  if (usager.etapeDemande && usager.etapeDemande < ETAPE_ENTRETIEN) {
    const dateRdv = new Date(usager.rdv.dateRdv);

    rdvDisplay.display = true;
    rdvDisplay.content = `${format(dateRdv, "dd MMMM yyyy", {
      locale: fr,
    })} à ${format(dateRdv, "HH:mm")}`;

    rdvDisplay.class = dateRdv < new Date() ? "danger" : "warning";
    return rdvDisplay;
  }

  return rdvDisplay;
};
