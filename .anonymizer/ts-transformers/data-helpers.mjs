import { fakerFR as faker } from "@faker-js/faker";

export  {
  firstName,
  lastName,
  fullName,
  phoneNumber,
  fromList,
  number,
  boolean,
  email,
  city,
  truncateDateToMonth,
  uuid,
};

function firstName() {
  return faker.person.firstName();
}

function lastName() {
  return faker.person.lastName();
}

function fullName() {
  return faker.person.fullName();
}

function uuid() {
  return faker.string.uuid()
}

function city() {
  return faker.location.city();
}

function phoneNumber() {
  return faker.phone.number();
}

function email() {
  return faker.internet.email();
}

function fromList(list) {
  const length = list.length;
  const randomIndex = faker.number.int({
    min: 0,
    max: length - 1,
  });
  return list[randomIndex];
}
function number(
  options = { min: 1, max: 10000000 }
) {
  return faker.number.int(options);
}

function boolean(options)  {
  if (options?.percentageTrue) {
    return number({ min: 1, max: 100 }) <= options.percentageTrue;
  }
  return faker.datatype.boolean();
}

function truncateDateToMonth(date) {
  const parsedDate = new Date(date);
  return new Date(parsedDate.getFullYear(), parsedDate.getMonth(), 1);
}