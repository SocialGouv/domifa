import { dataCompare, DataComparisonResult } from './dataCompare.service';
import { SortableAttribute } from './SortableAttribute.type';
import { SortableAttributeType } from './SortableAttributeType.type';


export const dataObjectCompare = {
  buildCompareAttributes,
  compareComparableObjects,
  compareObjects,
  objectsEquals,
};


function objectsEquals<T>(a: T, b: T, { attributes }: {
  attributes: (item: T) => any[];
}): boolean {

  return compareObjectsEquals(a, b, {
    attributes: item => {
      const values = item ? attributes(item) : undefined;
      if (values) {
        return values.map(value => ({
          value,
        }));
      }
      return undefined;
    },
  });

}


function compareObjectsEquals<T>(a: T, b: T, { attributes }: {
  attributes: (item: T) => SortableAttribute[];
}): boolean {

  return compareComparableObjectsEquals(
    {
      item: a,
      attributes: buildCompareAttributes(a, attributes),
    },
    {
      item: b,
      attributes: buildCompareAttributes(b, attributes),
    });
}


function compareComparableObjectsEquals<T>(a: DataComparableObject<T>, b: DataComparableObject<T>): boolean {

  const nullComparison = dataCompare.compareNullValues<T>(a.item, b.item, {});
  if (nullComparison !== undefined) {
    return false;
  }
  const attrs1 = a.attributes;
  const attrs2 = b.attributes;

  return attrs1.reduce((comparison, attr1, i) => {
    if (comparison) {
      return attr1.value === attrs2[i].value;
    }
    return comparison;
  }, true as boolean);
};

function compareObjects<T>(a: T, b: T, { asc, nullFirst, attributes }: {
  attributes: (item: T) => SortableAttribute[];
  asc?: boolean;
  nullFirst?: boolean;
}): DataComparisonResult {
  const globalAsc = (asc !== false);

  if (nullFirst === undefined) {
    nullFirst = false;
  }

  return compareComparableObjects(
    {
      item: a,
      attributes: buildCompareAttributes(a, attributes),
    },
    {
      item: b,
      attributes: buildCompareAttributes(b, attributes),
    },
    {
      nullFirst,
      globalAsc,
    });
}

export type DataComparableObjectAttribute = {
  value: any;
  asc: boolean;
}

export type DataComparableObject<T> = {
  item: T;
  attributes: DataComparableObjectAttribute[];
};

function compareComparableObjects<T>(a: DataComparableObject<T>, b: DataComparableObject<T>, {
  globalAsc,
  nullFirst,
}: {
  globalAsc: boolean,
  nullFirst: boolean,
}): DataComparisonResult {

  const nullComparison = dataCompare.compareNullValues<T>(a.item, b.item, { nullFirst });
  if (nullComparison !== undefined) {
    return nullComparison;
  }
  const attrs1 = a.attributes;
  const attrs2 = b.attributes;

  return attrs1.reduce((comparison, attr1, i) => {
    if (comparison === 0) {
      const isAsc = (globalAsc && attr1.asc) || (!globalAsc && !attr1.asc);
      const res = dataCompare.compareAttributes<T>(attr1.value, attrs2[i].value, { asc: isAsc, nullFirst });
      return res;
    }
    return comparison;
  }, 0 as DataComparisonResult);
};

function buildCompareAttributes<T>(item: T, attributes: (item: T) => SortableAttribute[]): DataComparableObjectAttribute[] {
  return attributes(item).filter(x => x != null).map(attr => ({
    value: formatAttribute(attr.value, attr.type),
    asc: (attr.asc !== false),
  }));
}


function formatAttribute(attr: any, type: SortableAttributeType) {
  if (type === 'full-text') {
    return formatTextAttribute(attr);
  } else {
    return attr;
  }
}

function formatTextAttribute(attr: string): string {
  return attr && attr.trim ? (attr as string).trim().toLowerCase() : attr;
}

