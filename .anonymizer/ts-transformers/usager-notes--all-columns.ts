import { main } from "./common/lib"
import {
  randomInt,
  fullName,
  truncateDateToMonthFromString,
  uuid,

} from "./common/data-helpers"
import { fakerFR as faker } from "@faker-js/faker"

function anonymize(values: Record<string, any>) {
  values.message = faker.lorem.sentence(5)
  values.createdBy = JSON.stringify({
    userId: randomInt(),
    userName: fullName(),
  })

  if (values.archived) {
    values.archivedBy = JSON.stringify({
      userId: randomInt(),
      userName: fullName(),
    })
  } else {
    values.archivedBy = JSON.stringify(null)
  }
}

main(['archived', "message", "createdBy", "archivedBy"], anonymize)
