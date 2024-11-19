import { Pipe, PipeTransform } from "@angular/core";
import { UsagersFilterCriteriaSortKey } from "../components/usager-filter";

@Pipe({
  name: "sortLabel",
  pure: true,
})
export class SortLabelPipe implements PipeTransform {
  private readonly LABELS_SORT: {
    [key in UsagersFilterCriteriaSortKey]:
      | string
      | ((statut?: string) => string);
  } = {
    NAME: "nom",
    ECHEANCE: (statut?: string) => {
      if (statut === "RADIE") return "radiation";
      if (statut === "REFUS") return "refus";
      return "échéance";
    },
    PASSAGE: "date de dernier passage",
    ID: "ID",
  };

  transform(sortKey: string, statut?: string): string {
    const label = this.LABELS_SORT[sortKey];
    if (typeof label === "function") {
      return label(statut);
    }
    return label || sortKey;
  }
}
