import * as faker from "faker/locale/fr";

const state = {
  initialized: false,
};

function get() {
  if (!state.initialized) {
    resetSeed();
  }

  return faker;
}

export const dataGenerator = {
  resetSeed,
  firstName,
  lastName,
  phoneNumber,
  fromList,
  fromListMany,
  fromListAndRemove,
  number,
  boolean,
  date,
  email,
  buildList,
};

function resetSeed({ seed }: { seed: number } = { seed: 123 }) {
  state.initialized = true;
  // be sure to have consistent generated values by setting the seed
  faker.seed(seed);
}

function firstName() {
  return get().name.firstName();
}
function lastName() {
  return get().name.lastName();
}
function phoneNumber() {
  return get().phone.phoneNumber();
}
function email({
  firstName,
  lastName,
  provider,
}: {
  firstName?: string;
  lastName?: string;
  provider?: string;
}) {
  return get().internet.email(firstName, lastName, provider);
}

function buildList<T>(nb: number, value: T): T[] {
  return buildArrayBySize(nb).map(() => value);
}

function fromList<T>(list: T[]): T {
  const length = list.length;
  const randomIndex = get().random.number({
    min: 0,
    max: length - 1,
  });
  return list[randomIndex];
}

function fromListMany<T>(list: T[], nb: number): T[] {
  return buildArrayBySize(nb).reduce(
    (acc, x, i) => {
      const { item, remaining } = fromListAndRemove(acc.remaining);
      if (item) {
        acc.items.push(item);
      }
      return {
        items: acc.items,
        remaining,
      };
    },
    {
      items: [] as T[],
      remaining: list,
    }
  ).items;
}

function buildArrayBySize(count: number): any[] {
  if (count > 0) {
    return Array.apply(null, Array(count));
  }
  return [];
}

function fromListAndRemove<T>(
  list: T[]
): {
  item: T;
  remaining: T[];
} {
  const length = list.length;

  if (length === 0) {
    return {
      item: undefined,
      remaining: [],
    };
  }
  const randomIndex = get().random.number({
    min: 0,
    max: length - 1,
  });
  const remaining = list.concat([]);
  remaining.splice(randomIndex, 1);
  const res = {
    item: list[randomIndex],
    remaining,
  };

  return res;
}

function number(options?: {
  min?: number;
  max?: number;
  precision?: number;
}): number {
  return get().random.number(options);
}

function boolean(options?: { percentageTrue?: number }): boolean {
  if (options && options.percentageTrue) {
    return number({ min: 1, max: 100, precision: 1 }) <= options.percentageTrue;
  }
  return get().random.boolean();
}

type MinMaxOptions = {
  min: number;
  max: number;
};
function date(options: {
  refDate?: Date;
  years?: MinMaxOptions;
  days?: MinMaxOptions;
}): Date {
  const refDate = options.refDate ? options.refDate : new Date();

  const { days, years } = options;

  if (years) {
    const min = (years.min ? years.min : 0) * 365 * 24 * 60;
    const max = years.max * 365 * 24 * 60;
    const minutesDiff = number({ min, max, precision: 1 });
    return new Date(refDate.getTime() + minutesDiff * 60 * 1000);
  }

  if (days) {
    const min = (days.min ? days.min : 0) * 24 * 60;
    const max = days.max * 24 * 60;
    const minutesDiff = number({ min, max, precision: 1 });
    return new Date(refDate.getTime() + minutesDiff * 60 * 1000);
  }

  return refDate;
}
