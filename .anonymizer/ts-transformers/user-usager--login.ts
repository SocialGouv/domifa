import { main } from "./common/lib"
import { fakerFR as faker } from "@faker-js/faker"

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
const LOGIN_LENGTH = 8
const ID_LENGTH = 6

const ID_SPACE = LETTERS.length ** ID_LENGTH
// Coprime with 26^6, so the modular multiplication stays bijective.
const SCRAMBLE = 15485863

// `login` has a UNIQUE index: the row id is encoded in the trailing characters
// so two rows can never produce the same value.
function fakeLogin(id: number): string {
  let encoded = ""
  let rest = (id * SCRAMBLE) % ID_SPACE

  for (let i = 0; i < ID_LENGTH; i++) {
    encoded = LETTERS[rest % LETTERS.length] + encoded
    rest = Math.floor(rest / LETTERS.length)
  }

  let prefix = ""
  for (let i = 0; i < LOGIN_LENGTH - ID_LENGTH; i++) {
    prefix += faker.helpers.arrayElement(LETTERS.split(""))
  }

  return prefix + encoded
}

function anonymize(values: Record<string, any>) {
  values.login = fakeLogin(Number(values.id))

}

main(anonymize)
