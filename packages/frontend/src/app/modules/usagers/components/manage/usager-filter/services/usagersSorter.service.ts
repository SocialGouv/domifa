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

  const asc = sortValue !== "descending";

  if (sortKey === "ID") {
    return sortUsagersByCustomRef(usagers, asc);
  } else {
    return dataSorter.sortMultiple(usagers, {
      getSortAttributes: (usager) => {
        const sortAttributes: SortableAttribute[] = [];

        if (sortKey === "RADIE" || sortKey === "REFUS") {
          sortAttributes.push(
            {
              value: usager.decision?.dateFin,
              asc,
            },
            {
              value: usager.nom?.toLowerCase(),
            },
            {
              value: usager.prenom?.toLowerCase(),
            }
          );
        } else if (
          sortKey === "INSTRUCTION" ||
          sortKey === "ATTENTE_DECISION"
        ) {
          sortAttributes.push(
            {
              value: usager.decision?.dateDecision,
              asc,
            },
            {
              value: usager.nom?.toLowerCase(),
            },
            {
              value: usager.prenom?.toLowerCase(),
            }
          );
        } else if (sortKey === "VALIDE" || sortKey === "TOUS") {
          sortAttributes.push(
            {
              value: usager.decision?.dateFin,
              asc,
            },
            {
              value: usager.nom?.toLowerCase(),
            },
            {
              value: usager.prenom?.toLowerCase(),
            }
          );
        } else if (sortKey === "PASSAGE") {
          sortAttributes.push(
            {
              value: usager.lastInteraction?.dateInteraction,
              asc,
            },
            {
              value: usager.nom?.toLowerCase(),
            },
            {
              value: usager.prenom?.toLowerCase(),
            }
          );
        } else if (sortKey === "NAME") {
          sortAttributes.push(
            {
              value: usager.nom?.toLowerCase(),
              asc,
            },
            {
              value: usager.prenom?.toLowerCase(),
            }
          );
        }
        return sortAttributes;
      },
    });
  }
}
function sortUsagersByCustomRef(usagers: UsagerLight[], asc: boolean) {
  // extract usagers with 'integer' or string' customRef format
  let { usagersWithCustomRefInteger, usagersWithCustomRefString } =
    usagers.reduce(
      (acc, usager) => {
        if (/^\d+$/.test(usager.customRef.trim())) {
          acc.usagersWithCustomRefInteger.push(usager);
        } else {
          acc.usagersWithCustomRefString.push(usager);
        }
        return acc;
      },
      { usagersWithCustomRefInteger: [], usagersWithCustomRefString: [] } as {
        usagersWithCustomRefInteger: UsagerLight[];
        usagersWithCustomRefString: UsagerLight[];
      }
    );
  // sort usagers with 'integer' customRef format
  usagersWithCustomRefInteger = dataSorter.sortMultiple(
    usagersWithCustomRefInteger,
    {
      getSortAttributes: (usager) => [
        {
          value: parseAsNumberOrString(usager.customRef?.trim()),
          asc,
        },
        {
          value: usager.nom?.toLowerCase(),
        },
        {
          value: usager.prenom?.toLowerCase(),
        },
      ],
    }
  );
  // sort usagers with string' customRef format
  usagersWithCustomRefString = dataSorter.sortMultiple(
    usagersWithCustomRefString,
    {
      getSortAttributes: (usager) => [
        {
          value: usager.customRef?.trim().toLowerCase(),
          asc,
        },
        {
          value: usager.nom?.trim().toLowerCase(),
        },
        {
          value: usager.prenom?.trim().toLowerCase(),
        },
      ],
    }
  );
  // is ASC: integer first
  return asc
    ? usagersWithCustomRefInteger.concat(usagersWithCustomRefString)
    : usagersWithCustomRefString.concat(usagersWithCustomRefInteger);
}

function parseAsNumberOrString(customRef: string): any {
  if (/^\d+$/.test(customRef)) {
    const customRefAsNumber = parseInt(customRef, 10);
    return customRefAsNumber; // sort as number
  }
  return customRef; // sort as string
}
