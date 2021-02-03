import { UsagerLight } from "../../../../../../../_common/model";
import { dataSorter, SortableAttribute } from "../../../../../../shared";
import { UsagersFilterCriteria } from "../UsagersFilterCriteria";

export const usagersSorter = {
  sortBy,
};

function sortBy(
  usagers: UsagerLight[],
  { sortKey, sortValue }: Pick<UsagersFilterCriteria, "sortKey" | "sortValue">
) {
  if (!sortKey) {
    return usagers;
  }
  return dataSorter.sortMultiple(usagers, {
    getSortAttributes: (usager) => {
      const sortAttributes: SortableAttribute[] = [];

      if (sortKey === "RADIE" || sortKey === "REFUS") {
        sortAttributes.push(
          {
            value: usager.decision?.dateFin,
            asc: sortValue !== "descending",
          },
          {
            value: usager.nom,
          },
          {
            value: usager.prenom,
          }
        );
      } else if (sortKey === "INSTRUCTION" || sortKey === "ATTENTE_DECISION") {
        sortAttributes.push(
          {
            value: usager.decision?.dateDecision,
            asc: sortValue !== "descending",
          },
          {
            value: usager.nom,
          },
          {
            value: usager.prenom,
          }
        );
      } else if (sortKey === "VALIDE" || sortKey === "TOUS") {
        sortAttributes.push(
          {
            value: usager.decision?.dateFin,
            asc: sortValue !== "descending",
          },
          {
            value: usager.nom,
          },
          {
            value: usager.prenom,
          }
        );
      } else if (sortKey === "PASSAGE") {
        sortAttributes.push(
          {
            value: usager.lastInteraction?.dateInteraction,
            asc: sortValue !== "descending",
          },
          {
            value: usager.nom,
          },
          {
            value: usager.prenom,
          }
        );
      } else if (sortKey === "NAME") {
        sortAttributes.push(
          {
            value: usager.nom,
            asc: sortValue !== "descending",
          },
          {
            value: usager.prenom,
          }
        );
      } else if (sortKey === "ID") {
        sortAttributes.push(
          {
            value: usager.customRef,
            asc: sortValue !== "descending",
          },
          {
            value: usager.nom,
          },
          {
            value: usager.prenom,
          }
        );
      }

      return sortAttributes;
    },
  });
}
