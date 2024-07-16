import { fakerFR as faker } from "@faker-js/faker";

export const dataGenerator = {
  firstName,
  lastName,
  phoneNumber,
  fromList,
  number,
  boolean,
  email,
  fullName,
  city,
};

function firstName() {
  return faker.person.firstName();
}

function city() {
  return faker.location.city();
}

function lastName() {
  return faker.person.lastName();
}
function fullName() {
  return faker.person.fullName();
}

function phoneNumber() {
  return faker.phone.number();
}

function email() {
  return faker.internet.email();
}

function fromList<T>(list: T[]): T {
  const length = list.length;
  const randomIndex = faker.number.int({
    min: 0,
    max: length - 1,
  });
  return list[randomIndex];
}
function number(
  options: { min?: number; max?: number } = { min: 1, max: 100000 }
): number {
  return faker.number.int(options);
}

function boolean(options?: { percentageTrue?: number }): boolean {
  if (options?.percentageTrue) {
    return number({ min: 1, max: 100 }) <= options.percentageTrue;
  }
  return faker.datatype.boolean();
}
