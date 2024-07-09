import { fakerFR as faker } from "@faker-js/faker"

export {
  firstName,
  lastName,
  fullName,
  phoneNumber,
  fromList,
  randomInt,
  email,
  city,
  truncateDateToMonthFromString,
  uuid,
}

function firstName() {
  return faker.person.firstName()
}

function lastName() {
  return faker.person.lastName()
}

function fullName() {
  return faker.person.fullName()
}

function uuid() {
  return faker.string.uuid()
}

function city() {
  return faker.location.city()
}

function phoneNumber() {
  return faker.phone.number()
}

function email() {
  return faker.internet.email()
}

function fromList<T>(list: T[]): T {
  const length = list.length
  const randomIndex = faker.number.int({
    min: 0,
    max: length - 1,
  })
  return list[randomIndex]
}
function randomInt(
  options: { min?: number; max?: number } = { min: 1, max: 10000000 }
): number {
  return faker.number.int(options)
}

function truncateDateToMonthFromString(date: string | null): string | null {
  if (!date || date === "null") {
    return null
  }

  const parsedDate = new Date(date)
  parsedDate.setDate(1)
  return parsedDate.toISOString()
}
