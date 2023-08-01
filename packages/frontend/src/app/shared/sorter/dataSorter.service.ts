import {
  DataComparableObject,
  dataObjectCompare,
} from "./dataObjectCompare.service";
import { SortableAttribute } from "./SortableAttribute.type";
import { SortableAttributeType } from "./SortableAttributeType.type";

export const dataSorter = {
  sortSingle,
  sortMultiple,
  sortByAttributes,
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

function sortSingle<T>(
  items: T[],
  {
    asc,
    nullFirst,
    getSortAttribute,
  }: {
    getSortAttribute: (item: T) => SortableAttribute;
    asc?: boolean;
    nullFirst?: boolean;
  }
): T[] {
  return sortMultiple(items, {
    getSortAttributes: (item: T) => [getSortAttribute(item)],
    asc,
    nullFirst,
  });
}

function sortByAttributes<T>(
  items: T[],
  attributes: { name: string; type?: SortableAttributeType }[],
  {
    asc,
    nullFirst,
  }: {
    asc?: boolean;
    nullFirst?: boolean;
  }
): T[] {
  return sortMultiple(items, {
    getSortAttributes: (item: T) => {
      const sortAttributes = attributes.map((attr) => ({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        value: (item as any)[attr.name],
        type: attr.type,
      }));
      return sortAttributes;
    },
    asc,
    nullFirst,
  });
}
