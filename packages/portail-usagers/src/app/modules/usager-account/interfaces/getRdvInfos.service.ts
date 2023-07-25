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

  if (!usager?.rdv?.dateRdv) {
    return rdvDisplay;
  }

  const dateRdv = new Date(usager.rdv.dateRdv);

  rdvDisplay.content = `Rendez-vous le ${format(
    dateRdv,
    "dd/MM/yyyy",
  )} à ${format(dateRdv, "HH:mm")}`;

  if (dateRdv > new Date()) {
    rdvDisplay.display = true;
  }

  return rdvDisplay;
};
