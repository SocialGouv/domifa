import { UsagerLight } from "../../../../../../_common/model";
import { dataSorter, SortableAttribute } from "../../../../../shared";
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

  const asc = sortValue !== "desc";

  if (sortKey === "ID") {
    return sortUsagersByCustomRef(usagers, asc);
  } else {
    return dataSorter.sortMultiple(usagers, {
      getSortAttributes: (usager) => {
        const sortAttributes: SortableAttribute[] = [];

        if (sortKey === "RADIE" || sortKey === "REFUS") {
          sortAttributes.push({
            value: usager.decision?.dateFin as Date,
            asc,
          });
        } else if (
          sortKey === "INSTRUCTION" ||
          sortKey === "ATTENTE_DECISION"
        ) {
          sortAttributes.push({
            value: usager.decision?.dateDecision,
            asc,
          });
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
        } else if (sortKey === "ECHEANCE") {
          sortAttributes.push({
            value: usager?.echeanceInfos?.dateToDisplay ?? null,
            asc,
          });
        } else if (sortKey === "PASSAGE") {
          sortAttributes.push({
            value: usager?.lastInteraction?.dateInteraction,
            asc,
          });
        }
        sortAttributes.push(
          {
            value: usager.nom?.toLowerCase(),
            asc,
          },
          {
            value: usager.prenom?.toLowerCase(),
          },
          {
            value: usager.surnom?.toLowerCase() ?? "",
          },
          {
            value: usager.ref,
            asc,
          }
        );
        return sortAttributes;
      },
    });
  }
}
function sortUsagersByCustomRef(
  usagers: UsagerLight[],
  asc: boolean
): UsagerLight[] {
  // extract usagers with 'integer' or string' customRef format
  let { usagersWithCustomRefInteger, usagersWithCustomRefString } =
    usagers.reduce(
      (acc, usager) => {
        if (usager.customRef) {
          if (/^\d+$/.test(usager.customRef)) {
            acc.usagersWithCustomRefInteger.push(usager);
          } else {
            acc.usagersWithCustomRefString.push(usager);
          }
        } else {
          acc.usagersWithCustomRefInteger.push(usager);
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
          value: parseAsNumberOrString(usager),
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
          value: usager.customRef
            ? usager.customRef.trim().toLowerCase()
            : usager.ref.toString(),
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

function parseAsNumberOrString(usager: UsagerLight): string | number {
  if (!usager.customRef) {
    return usager.ref;
  }
  if (/^\d+$/.test(usager.customRef)) {
    return parseInt(usager.customRef, 10);
  }
  return usager.customRef.trim(); // sort as string
}
