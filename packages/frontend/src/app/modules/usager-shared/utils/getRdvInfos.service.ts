import fr from "date-fns/locale/fr";
import { format } from "date-fns";
import {
  UsagerLight,
  UsagerRdvInfos,
  ETAPE_ENTRETIEN,
} from "../../../../_common/model";

export const getRdvInfos = (usager?: Partial<UsagerLight>): UsagerRdvInfos => {
  const rdvDisplay: UsagerRdvInfos = {
    display: false,
    class: "",
    content: "",
  };

  if (!usager?.rdv?.dateRdv) {
    return rdvDisplay;
  }

  const dateRdv = new Date(usager.rdv.dateRdv);

  // Rdv à venir
  if (usager.etapeDemande && usager.etapeDemande < ETAPE_ENTRETIEN) {
    rdvDisplay.display = true;
    rdvDisplay.content = `${format(dateRdv, "dd MMMM yyyy", {
      locale: fr,
    })} à ${format(dateRdv, "HH:mm")}`;

    rdvDisplay.class = dateRdv < new Date() ? "danger" : "warning";
    return rdvDisplay;
  }

  return rdvDisplay;
};
