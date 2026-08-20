import { fakerFR as faker } from "@faker-js/faker"

export { pseudoIdentifier, pseudoUserName, pseudoUserAgent }

// One process per table, so a Map is enough to keep a value's replacement
// stable across rows.
const identifiers = new Map<string, string>()
const userNames = new Map<string, string>()
const userAgents = new Map<string, string>()

function stable(
  cache: Map<string, string>,
  value: string,
  build: (index: number) => string
): string {
  const known = cache.get(value)
  if (known) {
    return known
  }

  const replacement = build(cache.size + 1)
  cache.set(value, replacement)
  return replacement
}

function pseudoIdentifier(value: string): string {
  return stable(
    identifiers,
    value,
    (index) => `login-${index}@domifa-fake.fabrique.social.gouv.fr`
  )
}

function pseudoUserName(value: string): string {
  return stable(userNames, value, () => faker.person.fullName())
}

function pseudoUserAgent(value: string): string {
  return stable(userAgents, value, () => faker.internet.userAgent())
}
