import {
  DataComparableObject,
  dataObjectCompare,
} from "./dataObjectCompare.service";
import { SortableAttribute } from "./SortableAttribute.type";

export const dataSorter = {
  sortMultiple,
};

function sortMultiple<T>(
  items: T[],
  {
    asc,
    nullFirst,
    getSortAttributes,
  }: {
    getSortAttributes: (item: T) => SortableAttribute[];
    asc?: boolean;
    nullFirst?: boolean;
  }
): T[] {
  const globalAsc = asc !== false;

  const sortableItems: DataComparableObject<T>[] = items.map((item) => ({
    item,
    attributes: dataObjectCompare.buildCompareAttributes(
      item,
      getSortAttributes
    ),
  }));

  return sortableItems
    .sort((a, b) =>
      dataObjectCompare.compareComparableObjects(a, b, {
        nullFirst: nullFirst ?? false,
        globalAsc,
      })
    )
    .map((x) => x.item);
}
