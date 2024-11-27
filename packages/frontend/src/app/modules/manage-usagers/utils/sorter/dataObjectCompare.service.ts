/* eslint-disable @typescript-eslint/no-explicit-any */
import { dataCompare, DataComparisonResult } from "./dataCompare.service";
import { SortableAttribute } from "./SortableAttribute.type";
import { SortableAttributeType } from "./SortableAttributeType.type";

export const dataObjectCompare = {
  buildCompareAttributes,
  compareComparableObjects,
};

export type DataComparableObjectAttribute = {
  value: any;
  asc: boolean;
};

export type DataComparableObject<T> = {
  item: T;
  attributes: DataComparableObjectAttribute[];
};

function compareComparableObjects<T>(
  a: DataComparableObject<T>,
  b: DataComparableObject<T>,
  {
    globalAsc,
    nullFirst,
  }: {
    globalAsc: boolean;
    nullFirst: boolean;
  }
): DataComparisonResult {
  const nullComparison = dataCompare.compareNullValues<T>(a.item, b.item, {
    nullFirst,
  });
  if (nullComparison !== undefined) {
    return nullComparison;
  }
  const attrs1 = a.attributes;
  const attrs2 = b.attributes;

  return attrs1.reduce((comparison, attr1, i) => {
    if (comparison === 0) {
      const isAsc = (globalAsc && attr1.asc) || (!globalAsc && !attr1.asc);
      return dataCompare.compareAttributes<T>(attr1.value, attrs2[i].value, {
        asc: isAsc,
        nullFirst,
      });
    }
    return comparison;
  }, 0 as DataComparisonResult);
}

function buildCompareAttributes<T>(
  item: T,
  attributes: (newItem: T) => SortableAttribute[]
): DataComparableObjectAttribute[] {
  return attributes(item)
    .filter((x) => x != null)
    .map((attr: SortableAttribute) => ({
      value: formatAttribute(attr.value, attr.type),
      asc: attr.asc !== false,
    }));
}

function formatAttribute(attr: any, type?: SortableAttributeType) {
  if (type === "full-text") {
    return formatTextAttribute(attr);
  }
  return attr;
}

function formatTextAttribute(attr: string): string {
  return attr && attr.trim() ? (attr as string).toLowerCase() : attr;
}
