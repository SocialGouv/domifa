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
  truncateJsonDateToMonth,
  truncateDateColumnToMonth,
  truncateTimestampColumnToMonth,
  uuid,
  maskMiddle,
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

// Output is not a parsable address: compare it as a string or display it.
function maskMiddle(value: string | null): string | null {
  if (!value || value === "null") {
    return null
  }

  if (value.length <= 4) {
    return "*".repeat(value.length)
  }

  return `${value.slice(0, 2)}${"*".repeat(value.length - 4)}${value.slice(-2)}`
}

function firstDayOfMonth(date: string): Date {
  const parsed = new Date(date)

  if (Number.isNaN(parsed.getTime())) {
    throw new Error(`Invalid date: ${date}`)
  }

  return new Date(Date.UTC(parsed.getUTCFullYear(), parsed.getUTCMonth(), 1))
}

// Dates nested in JSON columns: the app stores them as ISO-8601 strings.
function truncateJsonDateToMonth(date: string | null): string | null {
  if (!date || date === "null") {
    return null
  }

  return firstDayOfMonth(date).toISOString()
}

// `date` columns: greenmask decodes them with the "2006-01-02" layout.
function truncateDateColumnToMonth(date: string | null): string | null {
  if (!date || date === "null") {
    return null
  }

  return firstDayOfMonth(date).toISOString().slice(0, 10)
}

// `timestamptz` columns: greenmask decodes them with the
// "2006-01-02 15:04:05.999999999Z07" layout.
function truncateTimestampColumnToMonth(date: string | null): string | null {
  if (!date || date === "null") {
    return null
  }

  return `${firstDayOfMonth(date).toISOString().slice(0, 10)} 00:00:00Z`
}
