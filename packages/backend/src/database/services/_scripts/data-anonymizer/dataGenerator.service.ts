import { faker } from "@faker-js/faker";

faker.setLocale("fr");

export const dataGenerator = {
  firstName,
  lastName,
  phoneNumber,
  fromList,
  fromListAndRemove,
  number,
  boolean,
  email,
  city,
};

function firstName() {
  return faker.name.firstName();
}

function city() {
  return faker.address.city();
}

function lastName() {
  return faker.name.lastName();
}

function phoneNumber() {
  return faker.phone.number();
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
  return faker.internet.email(firstName, lastName, provider);
}

function fromList<T>(list: T[]): T {
  const length = list.length;
  const randomIndex = faker.datatype.number({
    min: 0,
    max: length - 1,
  });
  return list[randomIndex];
}

function fromListAndRemove<T>(list: T[]): {
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
  const randomIndex = faker.datatype.number({
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
  return faker.datatype.number(options);
}

function boolean(options?: { percentageTrue?: number }): boolean {
  if (options && options.percentageTrue) {
    return number({ min: 1, max: 100, precision: 1 }) <= options.percentageTrue;
  }
  return faker.datatype.boolean();
}
